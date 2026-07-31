import { Column, ColumnDef } from "@tanstack/react-table";
import { User } from "cv-graphql";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, ChevronRight } from "lucide-react";

const SortableHeader = ({ column, label }: { column: Column<User, unknown>; label: string }) => {
  const sorted = column.getIsSorted();
  let icon = null;
  if (sorted === "asc") {
    icon = <ArrowDown className="ml-2  h-[18px] w-[18px]" />;
  } else if (sorted === "desc") {
    icon = <ArrowUp className="ml-2  h-[18px] w-[18px]" />;
  }

  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="px-0 hover:bg-transparent"
    >
      {label}
      {icon}
    </Button>
  );
};

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
