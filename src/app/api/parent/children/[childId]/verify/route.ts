export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Update child user with email and verification token
    await User.findByIdAndUpdate(params.childId, {
      email,
      verificationToken,
      verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    // Send verification email
    await sendEmail({
      to: email,
      template: 'child-verification',
      subject: 'Verify Your Account',
      replacements: {
        verificationLink: `${process.env.NEXTAUTH_URL}/verify?token=${verificationToken}`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Error handling
  }
}
