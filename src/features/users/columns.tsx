import { Column, ColumnDef } from "@tanstack/react-table";
import { User } from "cv-graphql";
import { Avatar, AvatarFallback, AvatarImage, Button } from "@/components/ui";
import { ArrowDown, ArrowUp, ChevronRight } from "lucide-react";

const splitFullName = (fullName?: string | null) => {
  if (!fullName) return { firstName: "", lastName: "" };
  const parts = fullName.trim().split(/\s+/);
  return parts.length === 1
    ? { firstName: parts[0], lastName: "" }
    : { firstName: parts[0], lastName: parts.slice(1).join(" ") };
};

const SortableHeader = ({ column, label }: { column: Column<User, unknown>; label: string }) => {
  const sorted = column.getIsSorted();
  let icon = null;
  if (sorted === "asc") {
    icon = <ArrowDown className="ml-2 h-4 w-4" />;
  } else if (sorted === "desc") {
    icon = <ArrowUp className="ml-2 h-4 w-4" />;
  }

  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="px-0 hover:bg-transparent font-semibold"
    >
      {label}
      {icon}
    </Button>
  );
};

export const usersColumns: ColumnDef<User, unknown>[] = [
  {
    id: "avatar",
    header: "",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <Avatar>
          <AvatarImage src={user.profile?.avatar ?? undefined} />
          <AvatarFallback>{user.profile?.full_name?.[0] || user.email[0]}</AvatarFallback>
        </Avatar>
      );
    },
    accessorFn: (row) => row.profile?.avatar,
  },
  {
    id: "first_name",
    header: ({ column }) => <SortableHeader column={column} label="First Name" />,
    cell: ({ row }) => splitFullName(row.original.profile?.full_name).firstName,
    accessorFn: (row) => splitFullName(row.profile?.full_name).firstName,
  },
  {
    id: "last_name",
    header: ({ column }) => <SortableHeader column={column} label="Last Name" />,
    cell: ({ row }) => splitFullName(row.original.profile?.full_name).lastName,
    accessorFn: (row) => splitFullName(row.profile?.full_name).lastName,
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
    cell: () => (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <ChevronRight />
        </Button>
      </div>
    ),
    accessorFn: () => null,
  },
];
