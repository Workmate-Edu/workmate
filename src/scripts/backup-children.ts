import { connectDB, disconnect } from "@/lib/mongodb"
import { Child } from "@/models/child"
import fs from 'fs'
import path from 'path'

async function backupChildren() {
  try {
    await connectDB()
    
    const children = await Child.find()
      .populate('parent')
      .populate('assignedTeacher.teacherId')
      .lean()

    // Save backup to a file
    const backupPath = path.join(process.cwd(), 'backup-children.json')
    fs.writeFileSync(backupPath, JSON.stringify(children, null, 2))
    
    console.log(`Backup saved: ${children.length} children`)
    console.log(`Backup location: ${backupPath}`)
  } catch (error) {
    console.error('Backup failed:', error)
  } finally {
    await disconnect()
  }
}

backupChildren()
