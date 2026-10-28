import Typography from "@mui/material/Typography"
import type { Metadata } from "next"

import Footer from "../../components/Footer/Footer"
import UploadForm from "../../components/Form/UploadForm/UploadForm"
import Layout from "../../components/Layout/Layout"
import { TOOLS } from "../../config"

const tool = TOOLS.find((item) => item.path === "/games")

export const metadata: Metadata = {
  title: tool?.title ?? "Ottelut",
  description: tool?.description,
}

export default function GamesPage() {
  return (
    <Layout>
      <Typography variant="h1" component="h1" sx={{ mb: 2, fontSize: "1.75rem" }}>
        {tool?.title}
      </Typography>
      <UploadForm />
      <Footer />
    </Layout>
  )
}
