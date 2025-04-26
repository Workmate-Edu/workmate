export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Update child user credentials
    await User.findByIdAndUpdate(params.childId, {
      username,
      password: hashedPassword,
      isActive: true
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Error handling
  }
}
