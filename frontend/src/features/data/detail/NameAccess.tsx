import React from "react";
import { Link } from "@/components/ui";

export const DatasetNameAccess: React.FC<{
  dataset: { id: string, name: string };
}> = ({ dataset }) => (
  <Link appPath={ `/dataset/${ dataset.id }` } color='primary'>{ dataset.name }</Link>
)
