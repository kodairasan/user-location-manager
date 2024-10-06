import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

type User = {
    id: string
    name: string
    location: string
    details: string
}

const dataFilePath = path.join(process.cwd(), 'data', 'users.json')

async function readUsersFile(): Promise<User[]> {
    try {
        const data = await fs.readFile(dataFilePath, 'utf8')
        return JSON.parse(data)
    } catch (error) {
        console.error('Error reading users file:', error)
        return []
    }
}

async function writeUsersFile(users: User[]): Promise<void> {
    try {
        await fs.writeFile(dataFilePath, JSON.stringify(users, null, 2))
    } catch (error) {
        console.error('Error writing users file:', error)
    }
}

export async function GET() {
    const users = await readUsersFile()
    return NextResponse.json(users)
}

export async function POST(request: Request) {
    const users = await readUsersFile()
    const newUser: Omit<User, 'id'> = await request.json()
    const userWithId: User = {
        ...newUser,
        id: Date.now().toString(),
    }
    users.push(userWithId)
    await writeUsersFile(users)
    return NextResponse.json(userWithId)
}

export async function PUT(request: Request) {
    const users = await readUsersFile()
    const updatedUser: User = await request.json()
    const index = users.findIndex(user => user.id === updatedUser.id)
    if (index !== -1) {
        users[index] = updatedUser
        await writeUsersFile(users)
        return NextResponse.json(updatedUser)
    }
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
}

export async function DELETE(request: Request) {
    const { id }: { id: string } = await request.json()
    const users = await readUsersFile()
    const filteredUsers = users.filter(user => user.id !== id)
    if (users.length !== filteredUsers.length) {
        await writeUsersFile(filteredUsers)
        return NextResponse.json({ message: 'User deleted successfully' })
    }
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
}