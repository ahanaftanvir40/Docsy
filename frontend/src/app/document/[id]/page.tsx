"use client";
import { useQuery } from "@tanstack/react-query";
import { getDocumentById } from "@/lib/api";
import { useParams } from "next/navigation";

function SingleDoc() {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading, isError } = useQuery({
    queryKey: ["document", id],
    queryFn: () => getDocumentById(id),
  });
  console.log("Document Data:", data);

  return (
    <div>
      <h1>Document ID: {id}</h1>
      <p>This is the content for document with ID: {id}</p>
      {/* You can add more content or components here to display the document details */}
    </div>
  );
}

export default SingleDoc;
