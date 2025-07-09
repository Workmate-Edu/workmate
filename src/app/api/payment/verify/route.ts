import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Transaction } from "@/models/transaction"
import { User } from "@/models/user"
import { Subscription } from "@/models/subscription"
import sendEmail from "@/lib/sendSmtpMail"
import mongoose from "mongoose"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const transactionId = searchParams.get('transaction_id')
  const status = searchParams.get('status')

  // --- DEBUG: Log incoming query params ---
  console.log("=== Payment Verify API Called ===")
  console.log("transaction_id:", transactionId)
  console.log("status:", status)

  if (!transactionId || !status) {
    console.error("Missing transaction_id or status in query params")
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/failed`)
  }

  if (status !== 'successful') {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/failed`)
  }

  try {
    // --- DEBUG: Log before calling Flutterwave ---
    console.log("Verifying transaction with Flutterwave...")

    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`
        }
      }
    )

    const data = await response.json()
    // --- DEBUG: Log Flutterwave response ---
    console.log("=== FLW verify response ===")
    console.dir(data, { depth: null })

    if (data.status === 'success' && data.data.status === 'successful') {
      await connectDB()

      // --- DEBUG: Log before saving transaction ---
      console.log("Saving transaction to MongoDB...")

      const transaction = await Transaction.findOneAndUpdate(
        { transactionId: data.data.id },
        {
          transactionId: data.data.id,
          userId: data.data.meta.userId,
          amount: data.data.amount,
          currency: data.data.currency,
          status: 'completed',
          paymentMethod: data.data.payment_type,
          meta: {
            ...data.data.meta,
            customerEmail: data.data.customer.email,
            flwRef: data.data.flw_ref,
            txRef: data.data.tx_ref,
            subjects: typeof data.data.meta.subjects === "string"
              ? data.data.meta.subjects
              : JSON.stringify(data.data.meta.subjects)
          }
        },
        { upsert: true, new: true }
      )

      // --- DEBUG: Log transaction document ---
      console.log("=== Transaction saved ===")
      console.dir(transaction, { depth: null })

      // Update user subscription status immediately
      let updatedUser = null
      let paidUserEmail = ""
      let paidUserName = ""
      if (data.data.meta.userId) {
        // Parse subjects to update parent and children subscriptions
        let subjects: any[] = []
        try {
          // --- ERROR: subjects may be a stringified array or a plain string of subject names ---
          // If the frontend sends subjects as a string of subject names (e.g. "Math, Physics"), JSON.parse will not work.
          // If the frontend sends subjects as an array of objects, it should be stringified before sending.
          // Defensive fix: handle both cases.
          if (typeof data.data.meta.subjects === "string") {
            try {
              const parsed = JSON.parse(data.data.meta.subjects)
              if (Array.isArray(parsed)) {
                subjects = parsed
              } else {
                // If it's a comma-separated string, split into array of subject names
                subjects = data.data.meta.subjects.split(",").map((s: string) => ({
                  subject: s.trim()
                }))
              }
            } catch {
              // Not JSON, treat as comma-separated string
              subjects = data.data.meta.subjects.split(",").map((s: string) => ({
                subject: s.trim()
              }))
            }
          } else if (Array.isArray(data.data.meta.subjects)) {
            subjects = data.data.meta.subjects
          } else {
            subjects = []
          }
        } catch {
          subjects = []
        }

        // --- FIX: If no subjects, do not proceed with subscription creation ---
        if (!subjects || subjects.length === 0) {
          console.error("No subjects found in payment meta. Subscription will not be created.");
          return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/failed?reason=no_subjects`);
        }

        // Update parent subscription
        // --- FIX: Ensure existingSubscription is defined before using ---
        const userObjectId: any = mongoose.Types.ObjectId.isValid(data.data.meta.userId)
          ? new mongoose.Types.ObjectId(data.data.meta.userId)
          : data.data.meta.userId;

        const existingSubscription = await Subscription.findOne({ userId: userObjectId });

        // --- DEBUG: Log userObjectId and existingSubscription ---
        console.log("userObjectId:", userObjectId)
        console.log("existingSubscription:", existingSubscription)

        console.log("Updating user subscription for userId:", userObjectId, "type:", typeof userObjectId)
        updatedUser = await User.findByIdAndUpdate(
          userObjectId,
          {
            $set: {
              "subscription.status": "active",
              "subscription.lastPayment": new Date(),
              "subscription.lastTransactionId": data.data.id,
              "subscription.amount": data.data.amount,
              "subscription.currency": data.data.currency
            }
          },
          { new: true }
        ).lean();

        // Log the updated user document (plain object)
        console.log("=== Updated user (plain object) ===")
        console.dir(updatedUser, { depth: null })

        // Save for email
        paidUserEmail = updatedUser?.email
        paidUserName = updatedUser?.name

        // For each childId in subjects, update their subscription as well
        const childIds = [
          ...new Set(
            subjects
              .map((s: any) => s.childId)
              .filter((id: string) => id && id !== data.data.meta.userId)
          )
        ]
        if (childIds.length > 0) {
          const updateResult = await User.updateMany(
            { _id: { $in: childIds } },
            {
              $set: {
                "subscription.status": "active",
                "subscription.lastPayment": new Date(),
                "subscription.lastTransactionId": data.data.id,
                "subscription.amount": data.data.amount,
                "subscription.currency": data.data.currency
              }
            }
          )
          // Log the update result for children
          console.log("=== Children subscription update result ===")
          console.dir(updateResult, { depth: null })
        }

        // Create or update subscription document
        const plan = data.data.meta.plan || "weekly"
        let durationDays = 7
        if (plan === "monthly") durationDays = 28
        if (plan === "quarterly") durationDays = 84

        // Parse daysLeft from payment meta
        let extraDays = 0
        if (data.data.meta.daysLeft) {
          const parsed = parseInt(data.data.meta.daysLeft)
          if (!isNaN(parsed) && parsed > 0) {
            extraDays = parsed
          }
        }

        // --- Calculate extra days logic for renewal/upgrade only ---
        // STRATEGY: Maintain separate subscription periods for each subject+child (or parent) combo

        // 1. Build a map of previous subject+child combos to their dates
        let prevSubjectMap: Record<string, { startDate: Date; endDate: Date }> = {};
        if (existingSubscription && Array.isArray(existingSubscription.subjects)) {
          for (const prev of existingSubscription.subjects) {
            const key = `${prev.subject}:${prev.childId || ""}`;
            prevSubjectMap[key] = {
              startDate: prev.startDate ? new Date(prev.startDate) : existingSubscription.startDate,
              endDate: prev.endDate ? new Date(prev.endDate) : existingSubscription.endDate,
            };
          }
        }

        // 2. For each subject+child in the new subscription, calculate new start/end dates
        const now = new Date();
        const prevPlanRank = getRank(existingSubscription?.plan || "weekly");
        const newPlanRank = getRank(plan);

        // For each subject, set its own startDate/endDate
        const updatedSubjects = subjects.map((s: any) => {
          const key = `${s.subject}:${s.childId || ""}`;
          const prev = prevSubjectMap[key];
          let addExtraDays = false;
          if (prev) {
            // Renewal or upgrade for this subject+child
            if (newPlanRank >= prevPlanRank) {
              addExtraDays = true;
            }
          }
          const subjectStartDate = now;
          const subjectEndDate = new Date(
            now.getTime() +
              (durationDays + (addExtraDays ? extraDays : 0)) * 24 * 60 * 60 * 1000
          );
          return {
            ...s,
            startDate: subjectStartDate,
            endDate: subjectEndDate,
          };
        });

        // 3. Set subscription startDate/endDate as the max/min of all subject periods (for legacy compatibility)
        const allStartDates = updatedSubjects.map(s => s.startDate);
        const allEndDates = updatedSubjects.map(s => s.endDate);
        const subscriptionStartDate = allStartDates.length > 0 ? new Date(Math.min(...allStartDates.map(d => d.getTime()))) : now;
        const subscriptionEndDate = allEndDates.length > 0 ? new Date(Math.max(...allEndDates.map(d => d.getTime()))) : new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

        // Prepare update object
        // --- FIX: Merge previous subjects/children that are not being updated ---
        let mergedSubjects = updatedSubjects
        let mergedChildren = childIds.length > 0 ? childIds : undefined

        if (existingSubscription && Array.isArray(existingSubscription.subjects)) {
          // Keep previous subjects/children that are NOT being updated (not present in new subjects)
          const updatedCombos = new Set(updatedSubjects.map(s => `${s.subject}:${s.childId || ""}`))
          const prevSubjectsToKeep = existingSubscription.subjects.filter(
            (prev: any) => !updatedCombos.has(`${prev.subject}:${prev.childId || ""}`)
          )
          mergedSubjects = [...updatedSubjects, ...prevSubjectsToKeep]

          // Merge children: keep all unique children from previous and new
          const prevChildren = Array.isArray(existingSubscription.children) ? existingSubscription.children : []
          const allChildren = new Set([
            ...(childIds || []),
            ...prevChildren.map((id: any) => id?.toString?.() ?? id)
          ])
          mergedChildren = Array.from(allChildren)
        }

        const updateObj: any = {
          userId: userObjectId,
          status: "active",
          lastPayment: now,
          children: mergedChildren,
          subjects: mergedSubjects,
          plan,
          startDate: subscriptionStartDate,
          endDate: subscriptionEndDate,
        };

        const subscription = await Subscription.findOneAndUpdate(
          { userId: userObjectId },
          updateObj,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )

        // --- FIX: Remove or define isRenewal before using it ---
        // If you want to log whether this is a renewal or new subscription:
        const isRenewal = !!existingSubscription;

        // You can now use isRenewal to log, send different emails, or analytics
        console.log("Subscription type:", isRenewal ? "RENEWAL" : "NEW")

        if (subscription) {
          // Log only the subscription data (plain object)
          console.log("=== Subscription data ===")
          console.log({
            _id: subscription._id?.toString?.(),
            userId: subscription.userId?.toString?.(),
            status: subscription.status,
            plan: subscription.plan,
            startDate: subscription.startDate,
            endDate: subscription.endDate,
            lastPayment: subscription.lastPayment,
            children: subscription.children,
            subjects: subscription.subjects
          })
        } else {
          console.error("Subscription was not created or updated for userId:", userObjectId)
        }

        // Send subscription confirmation email to the paying user (parent) ONLY ONCE here
        if (paidUserEmail) {
          try {
            await sendEmail({
              to: paidUserEmail,
              subject: "Your Workmate Subscription is Active!",
              template: "subscription-success",
              replacements: {
                name: paidUserName || "User",
                amount: data.data.amount.toString(),
                currency: data.data.currency,
                date: new Date().toLocaleDateString(),
                transactionId: data.data.id.toString(),
                dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
              }
            })
            console.log("Subscription confirmation email sent to:", paidUserEmail)
          } catch (emailErr) {
            console.error("Failed to send subscription confirmation email:", emailErr)
          }
        }
      }

      // --- DEBUG: Log updated user document ---
      console.log("=== Updated user ===")
      console.dir(updatedUser, { depth: null })

      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/success`)
    }

    // --- DEBUG: Log failed verification ---
    console.error("Flutterwave verification failed or payment not successful")
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/failed`)
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/failed`)
  }
}

function getRank(plan: string) {
  switch (plan) {
    case "weekly": return 1;
    case "monthly": return 2;
    case "quarterly": return 3;
    default: return 0;
  }
}