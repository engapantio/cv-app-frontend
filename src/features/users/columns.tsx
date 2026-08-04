import { ColumnDef } from "@tanstack/react-table";
import { User } from "cv-graphql";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { SortableHeader } from "@/components/shared/sortable-header";

export const usersColumns: ColumnDef<User, unknown>[] = [
  {
    id: "id",
    accessorKey: "id",
    enableSorting: true,
    enableGlobalFilter: false,
    enableHiding: true,
    enableColumnFilter: false,
  },
  {
    id: "avatar",
    header: "",
    enableSorting: false,
    enableGlobalFilter: false,
    meta: { className: "w-14" },
    cell: ({ row }) => {
      const user = row.original;
      return (
        <Avatar className="size-10">
          <AvatarImage src={user.profile?.avatar ?? undefined} />
          <AvatarFallback>
            {user.profile?.full_name?.[0].toUpperCase() || user.email[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
      );
    },
    accessorFn: (row) => row.profile?.avatar,
  },
  {
    id: "first_name",
    header: ({ column }) => <SortableHeader column={column} label="First Name" />,
    cell: ({ row }) => row.original.profile?.first_name || "",
    accessorFn: (row) => row.profile?.first_name,
  },
  {
    id: "last_name",
    header: ({ column }) => <SortableHeader column={column} label="Last Name" />,
    cell: ({ row }) => row.original.profile?.last_name || "",
    accessorFn: (row) => row.profile?.last_name,
  },
  {
    id: "email",
    header: ({ column }) => <SortableHeader column={column} label="Email" />,
    accessorKey: "email",
  },
  {
    id: "department_name",
    header: ({ column }) => <SortableHeader column={column} label="Department" />,
    cell: ({ row }) => row.original.department_name || "",
    accessorKey: "department_name",
  },
  {
    id: "position_name",
    header: ({ column }) => <SortableHeader column={column} label="Position" />,
    cell: ({ row }) => row.original.position_name || "",
    accessorKey: "position_name",
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    enableSorting: false,
    enableGlobalFilter: false,
    meta: { className: "w-12" },
    cell: () => (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-[20px]">
          <ChevronRight />
        </Button>
      </div>
    ),
    accessorFn: () => null,
  },
];
