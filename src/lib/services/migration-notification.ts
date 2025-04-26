export async function notifyParentOfMigration(data: {
  parentEmail: string
  parentName: string
  children: Array<{
    name: string
    username: string
    tempPassword: string
  }>
}) {
  await sendEmail({
    to: data.parentEmail,
    template: 'child-account-migration',
    subject: 'New Login Details for Your Children',
    replacements: {
      parentName: data.parentName,
      children: data.children,
      loginUrl: `${process.env.NEXTAUTH_URL}/login`
    }
  })
}
