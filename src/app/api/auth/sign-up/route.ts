import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/user";
import bcrypt from "bcryptjs";
import { generateVerificationToken } from "@/lib/tokens";
import sendEmail from "@/lib/sendSmtpMail";

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
            ? `<div class="info-card">
                <h3>Children's Accounts</h3>
                <p>You'll receive separate emails with their credentials.</p>
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

    // Validate phone for teachers
    if (role === 'teacher') {
      if (!phone || !phone.startsWith('+')) {
        return NextResponse.json({ 
          error: "Phone number must include country code" 
        }, { status: 400 });
      }
    }

    // Debug log
    console.log('Received phone number:', phone);

    // Improve phone validation
    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // Clean and validate phone number
    const cleanPhone = phone.trim();
    const hasCountryCode = cleanPhone.startsWith('+') || cleanPhone.startsWith('00');

    if (!hasCountryCode) {
      return NextResponse.json({ 
        error: "Phone number must include country code starting with + or 00" 
      }, { status: 400 });
    }

    if (cleanPhone.length < 10) {
      return NextResponse.json({ 
        error: "Phone number is too short" 
      }, { status: 400 });
    }

    // Normalize phone number to always use + format
    const normalizedPhone = cleanPhone.startsWith('00') 
      ? `+${cleanPhone.slice(2)}` 
      : cleanPhone;

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

    if (!name || !username || !password || !role || !gender) {
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

      if (registeredAs === "child") {
        userData.email = `${normalizedUsername}@workmateteam.com`;
        userData.studentProfile.parent = parentId || null;
      }
    }

    // 👨‍🏫 Teacher
    if (role === "teacher") {
      const teacherSubjects = teacherProfile.subjects;

      if (!teacherSubjects || !Array.isArray(teacherSubjects) || teacherSubjects.length === 0) {
        return NextResponse.json({ error: "Subjects are required for teacher sign-up" }, { status: 400 });
      }

      userData.phone = phone;
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
        phone,
      };
    }

    // 👨‍👩‍👧 Parent with optional children
    if (role === "parent") {
      userData.parentProfile = {
        phone: phone || "",
        educationLevel: body.educationLevel || "",
        subjects: body.subjects || [],
        interestedInLearning: !!body.interestedInLearning, // <-- ensure this is set from request
        children: [],
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

    const emailConfig = getRoleSpecificContent(role, user);
    
    await sendEmail({
      to: user.email,
      subject: emailConfig.subject,
      template: emailConfig.template,
      replacements: emailConfig.data
    });

    const { password: _, ...userWithoutPassword } = user.toObject();

    return NextResponse.json({
      user: userWithoutPassword,
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
