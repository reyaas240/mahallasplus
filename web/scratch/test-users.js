const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const users = await prisma.user.findMany({
      select: { email: true, role: true }
    })
    console.log('Users and their roles:')
    users.forEach(u => console.log(`${u.email}: ${u.role}`))
    process.exit(0)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

main()
