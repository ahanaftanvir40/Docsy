import axios from "axios";
const BASE_URL = "http://localhost:8000/api";

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
