import MuiButton from "@mui/material/Button"

interface ButtonProps {
  type?: "button" | "submit"
  disabled?: boolean
  children: React.ReactNode
}

export default function Button({ children, type, disabled }: ButtonProps) {
  return (
    <MuiButton type={type} disabled={disabled} variant="contained" size="large" fullWidth>
      {children}
    </MuiButton>
  )
}
