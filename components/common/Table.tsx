import * as React from "react";
import { styled } from "@mui/material/styles";
import MuiTable from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
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

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#0288D1",
    color: theme.palette.common.white,
    fontWeight: 700,
    fontSize: 15,
    minWidth: 100,
    letterSpacing: 1,
    padding: "8px 10px",
    [theme.breakpoints.down("sm")]: {
      fontSize: 13,
      padding: "6px 6px",
    },
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    color: "#1A237E",
    padding: "8px 10px",
    [theme.breakpoints.down("sm")]: {
      fontSize: 12,
      padding: "6px 6px",
    },
    wordBreak: "break-word",
    maxWidth: 180,
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "#F5F7FA",
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
  transition: "background 0.2s",
  "&:hover": {
    backgroundColor: "#E3F2FD",
  },
}));

export default function Table<T extends Record<string, string>>({
  columns,
  data,
  sortKey,
  sortOrder,
}: TableProps<T>) {
  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          boxShadow: 3,
          // minWidth: { xs: 350, sm: 500, md: 700 },
        }}
      >
        <MuiTable
          sx={{
            // minWidth: { xs: 350, sm: 500, md: 700 },
            width: "100%",
            tableLayout: "auto",
          }}
          aria-label="customized table"
        >
          <TableHead>
            <TableRow>
              {columns.map((col, i) => (
                <StyledTableCell
                  key={i}
                  onClick={col.sortable ? col.onClick : undefined}
                  sx={{
                    cursor: col.sortable ? "pointer" : "default",
                    userSelect: col.sortable ? "none" : "auto",
                    color:
                      sortKey && col.key === sortKey ? "#FFD600" : undefined,
                  }}
                >
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    {col.label}
                    {col.sortable && col.key === sortKey
                      ? sortOrder === "asc"
                        ? " ▲"
                        : " ▼"
                      : col.sortable
                      ? " ⇅"
                      : null}
                  </span>
                </StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.length >= 1 ? (
              data.map((row, idx) => (
                <StyledTableRow key={row._id || idx}>
                  {columns.map((col, i) => (
                    <StyledTableCell key={i}>
                      {col.render
                        ? col.render(row, idx)
                        : col.key
                        ? row[col.key]
                        : ""}
                    </StyledTableCell>
                  ))}
                </StyledTableRow>
              ))
            ) : (
              <StyledTableRow>
                <StyledTableCell colSpan={columns.length} align="center">
                  No Data Found
                </StyledTableCell>
              </StyledTableRow>
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>
      <div className="block sm:hidden text-xs text-[#90A4AE] mt-1 text-center">
        Swipe left/right to see more columns
      </div>
    </div>
  );
}
