import { useMutation, useQuery } from "@tanstack/react-query";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import DashboardLayout from "@/layouts/DashboardLayout";
import { createUser, deleteUser, fetchMe, fetchUsers, updateUser } from "@/services/api";
import { queryClient } from "@/services/query-client";
import { useAuthStore } from "@/store/auth-store";
import type { RoleName, User } from "@/types";

const roleOptions: RoleName[] = ["admin", "moderator", "doctorant", "supervisor", "employee"];

export default function UsersPage() {
  const { hasHydrated, isAuthenticated } = useAuthGuard();
  const allowed = hasHydrated && isAuthenticated;
  const storedUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchMe,
    enabled: allowed && !storedUser,
  });

  useEffect(() => {
    if (meQuery.data) {
      setUser(meQuery.data);
    }
  }, [meQuery.data, setUser]);

  const currentUser = storedUser || meQuery.data;
  const isAdmin = currentUser?.role.name === "admin";

  const usersQuery = useQuery({
    queryKey: ["users", "admin-list"],
    queryFn: fetchUsers,
    enabled: allowed && isAdmin,
  });

  const [createPayload, setCreatePayload] = useState({
    username: "",
    email: "",
    password: "",
    role_name: "doctorant" as RoleName,
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPayload, setEditPayload] = useState({
    username: "",
    email: "",
    password: "",
    role_name: "doctorant" as RoleName,
    is_active: true,
  });

  const createMutation = useMutation({
    mutationFn: () => createUser(createPayload),
    onSuccess: () => {
      toast.success("Foydalanuvchi yaratildi");
      setCreatePayload({ username: "", email: "", password: "", role_name: "doctorant" });
      void queryClient.invalidateQueries({ queryKey: ["users", "admin-list"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Yaratishda xatolik");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: number; payload: typeof editPayload }) =>
      updateUser(userId, {
        username: payload.username,
        email: payload.email,
        role_name: payload.role_name,
        is_active: payload.is_active,
        password: payload.password || undefined,
      }),
    onSuccess: () => {
      toast.success("Foydalanuvchi yangilandi");
      setEditingId(null);
      void queryClient.invalidateQueries({ queryKey: ["users", "admin-list"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Yangilashda xatolik");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: number) => deleteUser(userId),
    onSuccess: () => {
      toast.success("Foydalanuvchi o'chirildi");
      void queryClient.invalidateQueries({ queryKey: ["users", "admin-list"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "O'chirishda xatolik");
    },
  });

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (createMutation.isPending) {
      return;
    }
    await createMutation.mutateAsync();
  };

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setEditPayload({
      username: user.username,
      email: user.email,
      password: "",
      role_name: user.role.name,
      is_active: user.is_active,
    });
  };

  const onSaveEdit = async (userId: number) => {
    if (updateMutation.isPending) {
      return;
    }
    await updateMutation.mutateAsync({ userId, payload: editPayload });
  };

  const onDelete = async (userId: number) => {
    if (deleteMutation.isPending) {
      return;
    }
    const confirmed = window.confirm("Foydalanuvchini o'chirishni tasdiqlaysizmi?");
    if (!confirmed) {
      return;
    }
    await deleteMutation.mutateAsync(userId);
  };

  if (!hasHydrated) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Session tekshirilmoqda...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!isAdmin) {
    return (
      <DashboardLayout title="Users Management">
        <Card>
          <CardContent className="py-8 text-sm text-destructive">Ushbu bo&apos;lim faqat admin uchun mavjud.</CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Users Management" subtitle="Admin uchun to'liq CRUD huquqlari">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Yangi foydalanuvchi yaratish</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-5" onSubmit={onCreate}>
            <Input
              placeholder="username"
              value={createPayload.username}
              onChange={(e) => setCreatePayload((prev) => ({ ...prev, username: e.target.value }))}
              required
            />
            <Input
              placeholder="email"
              value={createPayload.email}
              onChange={(e) => setCreatePayload((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
            <Input
              placeholder="password"
              type="password"
              value={createPayload.password}
              onChange={(e) => setCreatePayload((prev) => ({ ...prev, password: e.target.value }))}
              required
            />
            <Select
              value={createPayload.role_name}
              onValueChange={(value) => setCreatePayload((prev) => ({ ...prev, role_name: value as RoleName }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Saqlanmoqda..." : "Create"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Foydalanuvchilar ro&apos;yxati</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(usersQuery.data || []).map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>
                    {editingId === user.id ? (
                      <Input
                        value={editPayload.username}
                        onChange={(e) => setEditPayload((prev) => ({ ...prev, username: e.target.value }))}
                      />
                    ) : (
                      user.username
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === user.id ? (
                      <Input value={editPayload.email} onChange={(e) => setEditPayload((prev) => ({ ...prev, email: e.target.value }))} />
                    ) : (
                      user.email
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === user.id ? (
                      <Select
                        value={editPayload.role_name}
                        onValueChange={(value) => setEditPayload((prev) => ({ ...prev, role_name: value as RoleName }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      user.role.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === user.id ? (
                      <Select
                        value={editPayload.is_active ? "true" : "false"}
                        onValueChange={(value) => setEditPayload((prev) => ({ ...prev, is_active: value === "true" }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">true</SelectItem>
                          <SelectItem value="false">false</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : user.is_active ? (
                      "true"
                    ) : (
                      "false"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {editingId === user.id ? (
                        <>
                          <Input
                            type="password"
                            placeholder="new password (optional)"
                            value={editPayload.password}
                            onChange={(e) => setEditPayload((prev) => ({ ...prev, password: e.target.value }))}
                          />
                          <Button size="sm" onClick={() => void onSaveEdit(user.id)} disabled={updateMutation.isPending}>
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => startEdit(user)}>
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={deleteMutation.isPending || currentUser?.id === user.id}
                            onClick={() => void onDelete(user.id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
