import * as React from "react";
import MuiTable from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

export interface Column<T> {
  key?: keyof T;
  label: React.ReactNode;
  render?: (row: T, idx?: number) => React.ReactNode;
  sortable?: boolean;
  onClick?: () => void;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  sortKey?: string;
  sortOrder?: "asc" | "desc";
}

export default function Table<T extends Record<string, unknown>>({
  columns,
  data,
  sortKey,
  sortOrder,
}: TableProps<T>) {
  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 2,
        border: "1px solid #B3E5FC",
        background: "#F8FBFF",
        boxShadow: "none",
        overflowX: "auto",
      }}
    >
      <MuiTable sx={{ minWidth: 650, fontSize: { xs: 12, sm: 16 } }}>
        <TableHead>
          <TableRow sx={{ background: "#E3F2FD" }}>
            {columns.map((col, i) => (
              <TableCell
                key={i}
                align="left"
                sx={{
                  py: 1.5,
                  px: { xs: 1, sm: 2 },
                  color: "#0288D1",
                  fontWeight: 600,
                  background: "#E3F2FD",
                  cursor: col.sortable ? "pointer" : "default",
                  userSelect: col.sortable ? "none" : "auto",
                }}
                onClick={col.sortable ? col.onClick : undefined}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {col.label}
                  {col.sortable && col.key === sortKey
                    ? sortOrder === "asc"
                      ? " ▲"
                      : " ▼"
                    : col.sortable
                    ? " ⇅"
                    : null}
                </span>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.length >= 1 ? (
            data.map((row, idx) => (
              <TableRow
                key={
                  typeof row._id === "string" || typeof row._id === "number"
                    ? row._id
                    : idx
                }
                sx={{
                  borderTop: "1px solid #B3E5FC",
                  transition: "background 0.2s",
                  "&:hover": { background: "#e3f2fd99" },
                }}
              >
                {columns.map((col, i) => (
                  <TableCell
                    key={i}
                    sx={{
                      py: 1.5,
                      px: { xs: 1, sm: 2 },
                      fontSize: { xs: 12, sm: 16 },
                      borderColor: "#B3E5FC",
                    }}
                  >
                    {col.render
                      ? col.render(row, idx)
                      : col.key
                      ? String(row[col.key] ?? "")
                      : ""}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                align="center"
                sx={{ py: 3, color: "#90A4AE" }}
              >
                No Data Found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </MuiTable>
      <div className="block sm:hidden text-xs text-[#90A4AE] mt-1 text-center">
        Swipe left/right to see more columns
      </div>
    </TableContainer>
  );
}
