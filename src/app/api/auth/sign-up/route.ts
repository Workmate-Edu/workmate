import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/user";
import bcrypt from "bcryptjs";
import { generateVerificationToken } from "@/lib/tokens";
import sendEmail from "@/lib/sendSmtpMail";
import { parentOnboardingSchema } from '@/lib/parent-onboarding';
import { assignLearnerIdentities } from '@/lib/learner-identity';
import { legalRecord, TEACHER_CONDUCT_VERSION, validateCommonLegalChoices } from '@/lib/legal-consent';
import { isValidInternationalPhoneNumber, normalizePhoneNumber } from '@/lib/phone-number';
import { notifyAdminsOfTeacherReview } from '@/lib/admin-teacher-review-notifications';

const getRoleSpecificContent = (role: string, user: any) => {
  switch (role) {
    case 'teacher':
      return {
        template: 'teacher-signup',
        subject: 'Welcome to Workmate - Teacher Application',
        data: {
          baseUrl: process.env.NEXTAUTH_URL,
          name: user.name,
          email: user.email,
          username: user.username,
          verificationLink: `${process.env.NEXTAUTH_URL}/verify-email?token=${user.verificationToken}`,
          subjects: user.teacherProfile.subjects
            .map((s: any) => s.subjects.join(', '))
            .join(', '),
          qualifications: user.teacherProfile.qualifications
            .map((q: any) => q.degree)
            .join(', ')
        }
      };

    case 'student':
      return {
        template: 'student-signup',
        subject: 'Welcome to Workmate - Student Account',
        data: {
          baseUrl: process.env.NEXTAUTH_URL,
          name: user.name,
          email: user.email,
          username: user.username,
          verificationLink: `${process.env.NEXTAUTH_URL}/verify-email?token=${user.verificationToken}`,
          grade: user.studentProfile.grade,
          subjects: user.studentProfile.subjects
            .map((s: any) => s.name)
            .join(', ')
        }
      };

    case 'parent':
      return {
        template: 'parent-signup',
        subject: 'Welcome to Workmate - Parent Account',
        data: {
          baseUrl: process.env.NEXTAUTH_URL,
          name: user.name,
          email: user.email,
          username: user.username,
          verificationLink: `${process.env.NEXTAUTH_URL}/verify-email?token=${user.verificationToken}`,
          childrenDetails: user.parentProfile?.children?.length 
            ? `<div class="info-card" style="background-color:#F5F7FA;border:1px solid #E2E8F0;border-radius:8px;padding:20px;margin:20px 0;">
                <h3 style="margin:0 0 12px;font-size:18px;color:#1E293B;">Children's Accounts</h3>
                <p style="margin:0;line-height:1.6;">You'll receive separate emails with their credentials.</p>
              </div>`
            : ''
        }
      };
  }
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, role } = body;
    let onboarding;
    if (role === 'parent' && body.parentProfile?.onboarding !== undefined) {
      const parsed = parentOnboardingSchema.safeParse(body.parentProfile.onboarding);
      if (!parsed.success) return NextResponse.json({ error: 'Please check your children and availability details' }, { status: 400 });
      onboarding = parsed.data;
    }

    if (!["parent", "student", "teacher"].includes(role)) {
      return NextResponse.json({ error: "Invalid account role" }, { status: 400 });
    }

    const legalError = validateCommonLegalChoices(body);
    if (legalError) return NextResponse.json({ error: legalError }, { status: 400 });
    if (role === 'student' && (body.ageGroup !== '18+' || body.adultConfirmed !== true || body.registeredAs === 'child' || body.parentId)) {
      return NextResponse.json({ error: 'Independent learner accounts are only for adults aged 18 or older. A parent or guardian must create the account for a minor.' }, { status: 400 });
    }
    if (role === 'parent') {
      if (body.parentalAuthority !== true) return NextResponse.json({ error: 'Confirm that you are the parent or legal guardian for each child' }, { status: 400 });
      if (!onboarding?.learners.every(learner => Number.isInteger(learner.age) && learner.age! >= 6 && learner.age! <= 16)) {
        return NextResponse.json({ error: 'Enter an age from 6 to 16 for each child' }, { status: 400 });
      }
    }
    if (role === 'teacher' && body.teacherConductAccepted !== true) {
      return NextResponse.json({ error: 'Accept the current teacher confidentiality, conduct and meeting rules' }, { status: 400 });
    }

    const normalizedPhone = normalizePhoneNumber(phone);
    if (!normalizedPhone || !isValidInternationalPhoneNumber(normalizedPhone)) {
      return NextResponse.json({
        error: 'Enter a valid phone number with its country code, for example +2348012345678',
      }, { status: 400 });
    }

    // Update the body with normalized phone
    body.phone = normalizedPhone;

    const {
      name,
      email,
      username,
      password,
      gender,
      grade,
      registeredAs = "independent",
      children = [],
      teacherProfile = {}, 
    } = body;

    if (!gender) {
      return NextResponse.json({ error: "Gender is required" }, { status: 400 });
    }

    if (!name || !username || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const normalizedUsername = username.toLowerCase();
    const normalizedEmail = email?.toLowerCase();

    const existingUsername = await User.findOne({ username: normalizedUsername });
    if (existingUsername) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }

    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData: any = {
      name,
      email: normalizedEmail,
      username: normalizedUsername,
      password: hashedPassword,
      role,
      gender,
      emailVerified: false,
      phone: normalizedPhone,
      residenceCountry: body.residenceCountry,
      legalAcknowledgements: {
        ...legalRecord(body),
        ...(role === 'teacher' ? { teacherConduct: { version: TEACHER_CONDUCT_VERSION, acceptedAt: new Date() } } : {}),
        ...(role === 'parent' ? { parentalAuthority: { noticeVersion: '2026-10-18', acknowledgedAt: new Date(), verificationStatus: 'pending' } } : {}),
        ...(role === 'student' ? { adultStatus: { confirmedAt: new Date() } } : {}),
      },
      safeguarding: role === 'parent'
        ? { parentalVerification: { status: 'pending', requestedAt: new Date() } }
        : { parentalVerification: { status: 'not_required' } },
    };

    // 🧒 Student (independent or child)
    if (role === "student") {
      const { subjects, parentId } = body;

      if (!subjects || !Array.isArray(subjects) || subjects.length === 0 || !grade) {
        return NextResponse.json({ error: "Subjects and grade are required for students" }, { status: 400 });
      }

      userData.studentProfile = {
        registeredAs,
        grade,
        subjects: subjects.map((subject: any) => ({
          name: subject.name,
          area: subject.area,
          progress: 0,
        })),
      };

      // Public signup never creates a child account. Minors use the guardian journey.
    }

    // 👨‍🏫 Teacher
    if (role === "teacher") {
      const teacherSubjects = teacherProfile.subjects;

      if (!teacherSubjects || !Array.isArray(teacherSubjects) || teacherSubjects.length === 0) {
        return NextResponse.json({ error: "Subjects are required for teacher sign-up" }, { status: 400 });
      }

      userData.phone = normalizedPhone;
      userData.teacherProfile = {
        subjects: teacherSubjects.map((s: any) => ({
          area: s.area,
          subjects: s.subjects,
        })),
        qualifications: teacherProfile.qualifications || [],
        verificationStatus: "pending",
        adminVerified: false,
        rating: 0,
        availability: teacherProfile.availability || [],
        reviews: [],
        bio: teacherProfile.bio || "",
        phone: normalizedPhone,
      };
    }

    // 👨‍👩‍👧 Parent with optional children
    
      if (role === "parent") {
      userData.parentProfile = {
        ...(onboarding ? { onboarding: { ...onboarding, learners: assignLearnerIdentities({ role: 'parent', ownerId: '', learners: onboarding.learners }), status: 'pending', submittedAt: new Date() } } : {}),
        phone: body.phone || "",
        // NOW reading from nested parentProfile payload
        educationLevel:       body.parentProfile?.educationLevel || "",
        subjects:             body.parentProfile?.subjects       || [],
        interestedInLearning: !!body.parentProfile?.interestedInLearning,
        children:             [],
      };

      // Create child accounts - deprecated for now - Parent can do that on dashboard
      if (children.length > 0) {
        const childUsers = await Promise.all(
          children.map(async (child: any) => {
            const childHashedPassword = await bcrypt.hash(child.password, 10);

            const childUser = new User({
              name: child.name,
              email: `${child.username.toLowerCase()}@workmateteam.com`,
              username: child.username.toLowerCase(),
              password: childHashedPassword,
              role: "student",
              gender: child.gender || "unspecified",
              studentProfile: {
                registeredAs: "child",
                parent: null, // Linked later
                grade: child.grade,
                subjects: (child.subjects || []).map((s: any) => ({
                  name: s.name,
                  area: s.area,
                  progress: 0,
                })),
              },
              emailVerified: true, // Children don’t need to verify
            });

            await childUser.save();
            return childUser._id;
          })
        );

        userData.parentProfile.children = childUsers;
      }
    }

    // Save Main User
    const user = new User(userData);

    // Link parent ID to created children
    if (role === "parent" && userData.parentProfile.children.length > 0) {
      await User.updateMany(
        { _id: { $in: userData.parentProfile.children } },
        { $set: { "studentProfile.parent": user._id } }
      );
    }

    // Email Verification
    const token = generateVerificationToken(user._id);
    user.verificationToken = token;
    user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await user.save();

    if (role === 'teacher') {
      await notifyAdminsOfTeacherReview({ id: String(user._id), name: user.name, email: user.email }, 'application');
    }

    const emailConfig = getRoleSpecificContent(role, user);
    
    await sendEmail({
      to: user.email,
      subject: emailConfig.subject,
      template: emailConfig.template,
      replacements: emailConfig.data
    });

    return NextResponse.json({
      user: { id: String(user._id), name: user.name, email: user.email, role: user.role, emailVerified: user.emailVerified },
      message: "Verification email sent",
      emailVerificationSent: true,
    });
  } catch (error) {
    console.error("Sign up error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create account" },
      { status: 500 }
    );
  }
}
