import axios from "axios";
const BASE_URL = "http://localhost:8000/api";

export async function createDocument() {
  const token = localStorage.getItem("token");
  console.log(`Creating a new document with token: ${token}`);

  const response = await axios.post(
    `${BASE_URL}/document/create`,
    {
      title: "Untitled Document",
      content: "",
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  console.log(`Document created successfully:`, response.data);

  return response.data;
}

export const updateDocument = async (
  id: string,
  data: { title?: string; content?: string }
) => {
  const token = localStorage.getItem("token");

  const response = await axios.put(`${BASE_URL}/document/update/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export async function deleteDocument(id: string) {
  const token = localStorage.getItem("token");

  const response = await axios.delete(`${BASE_URL}/document/delete/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function getDocuments() {
  const token = localStorage.getItem("token");

  const response = await axios.get(`${BASE_URL}/document/getAll`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function getDocumentById(id: string) {
  const token = localStorage.getItem("token");

  const response = await axios.get(`${BASE_URL}/document/get/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
