"use client"

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import socket from '@/lib/socket'
import UpdateNotification from './UpdateNotification'

type User = {
    id: string
    name: string
    location: string
    details: string
}

const defaultLocations = ['407/408/居室', '授業', 'リフレッシュルーム', '外出', '帰宅', 'その他']

export default function UserLocationManager() {
    const [users, setUsers] = useState<User[]>([])
    const [newUser, setNewUser] = useState({ name: '', location: '', details: '' })
    const [searchTerm, setSearchTerm] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [changedUsers, setChangedUsers] = useState<string[]>([])

    useEffect(() => {
        fetchUsers()

        socket.on('dataUpdated', fetchUsers)

        return () => {
            socket.off('dataUpdated')
        }
    }, [])

    const fetchUsers = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/users')
            if (!response.ok) {
                throw new Error('Failed to fetch users')
            }
            const data = await response.json()
            setUsers(data)
        } catch (error: any) {
            console.error("fetchUsers error:", error);
            setError('ユーザーの読み込みに失敗しました。もう一度お試しください。');
        } finally {
            setIsLoading(false)
        }
    }

    const addUser = async () => {
        if (newUser.name && newUser.location) {
            try {
                const response = await fetch('/api/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newUser),
                })
                if (!response.ok) {
                    throw new Error('Failed to add user')
                }
                const addedUser = await response.json()
                setUsers([...users, addedUser])
                setNewUser({ name: '', location: '', details: '' })
            } catch (error: any) {
                console.error("addUser error:", error);
                setError('ユーザーの追加に失敗しました。もう一度お試しください。');
            }
        }
    }

    const updateUser = (id: string, field: string, value: string) => {
        setUsers(users.map(user => user.id === id ? { ...user, [field]: value } : user))
        if (!changedUsers.includes(id)) {
            setChangedUsers([...changedUsers, id])
        }
    }

    const saveUser = async (id: string) => {
        try {
            const userToUpdate = users.find(user => user.id === id)
            if (!userToUpdate) return

            const response = await fetch('/api/users', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userToUpdate),
            })
            if (!response.ok) {
                throw new Error('Failed to update user')
            }
            setChangedUsers(changedUsers.filter(userId => userId !== id))
        } catch (error: any) {
            console.error("saveUser error:", error);
            setError('ユーザーの更新に失敗しました。もう一度お試しください。');
        }
    }

    const deleteUser = async (id: string) => {
        try {
            const response = await fetch('/api/users', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            })
            if (!response.ok) {
                throw new Error('Failed to delete user')
            }
            setUsers(users.filter(user => user.id !== id))
            setChangedUsers(changedUsers.filter(userId => userId !== id))
        } catch (error: any) {
            console.error("deleteUser error:", error);
            setError('ユーザーの削除に失敗しました。もう一度お試しください。');
        }
    }

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.details.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (isLoading) return (
        <div className="flex justify-center items-center h-screen">
            <span className="animate-spin text-9xl">💩</span>
        </div>
    )
    if (error) return <div>{error}</div>

    return (
        <div className="container mx-auto p-4">
            <UpdateNotification />
            <h1 className="text-2xl font-bold mb-4">在室管理システム</h1>

            <Input
                type="text"
                placeholder="ユーザーまたは場所を検索"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4"
            />

            <div className="flex flex-wrap gap-2 mb-4">
                <Input
                    type="text"
                    placeholder="名前"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="flex-grow"
                />
                <Select
                    value={newUser.location}
                    onValueChange={(value) => setNewUser({ ...newUser, location: value })}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="場所を選択" />
                    </SelectTrigger>
                    <SelectContent>
                        {defaultLocations.map((location) => (
                            <SelectItem key={location} value={location}>{location}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Textarea
                    placeholder="詳細"
                    value={newUser.details}
                    onChange={(e) => setNewUser({ ...newUser, details: e.target.value })}
                    className="w-full mt-2"
                />
                <Button onClick={addUser} className="w-full mt-2">ユーザー追加</Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>名前</TableHead>
                        <TableHead>居場所</TableHead>
                        <TableHead>詳細</TableHead>
                        <TableHead>操作</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredUsers.map(user => (
                        <TableRow key={user.id}>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>
                                <Select
                                    value={user.location}
                                    onValueChange={(value) => updateUser(user.id, 'location', value)}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="場所を選択" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {defaultLocations.map((location) => (
                                            <SelectItem key={location} value={location}>{location}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell>
                                <Textarea
                                    value={user.details}
                                    onChange={(e) => updateUser(user.id, 'details', e.target.value)}
                                    className="w-full"
                                />
                            </TableCell>
                            <TableCell>
                                <div className="flex space-x-2">
                                    <Button
                                        onClick={() => saveUser(user.id)}
                                        disabled={!changedUsers.includes(user.id)}
                                    >
                                        保存
                                    </Button>
                                    <Button variant="destructive" onClick={() => deleteUser(user.id)}>削除</Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}