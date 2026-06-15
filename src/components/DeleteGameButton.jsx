"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteGameButton({ id, title }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    // 1. Demander confirmation avant de supprimer
    const confirmed = window.confirm(`⚠️ Es-tu sûr de vouloir supprimer définitivement "${title}" de ta ludothèque ?`);
    
    if (confirmed) {
      setIsDeleting(true);
      try {
        // 2. Envoyer la requête DELETE à notre API
        const res = await fetch(`/api/games/${id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          // 3. Rediriger vers l'accueil et forcer le rafraîchissement
          router.push("/");
          router.refresh();
        } else {
          alert("Erreur lors de la suppression du jeu.");
          setIsDeleting(false);
        }
      } catch (error) {
        alert("Erreur réseau lors de la suppression.");
        setIsDeleting(false);
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={`px-4 py-2 rounded-md font-medium flex items-center gap-2 shadow-sm transition-colors border ${
        isDeleting 
        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" 
        : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
      }`}
    >
      {isDeleting ? (
        "Suppression..."
      ) : (
        <>
          <span className="material-icons text-sm">delete</span> Supprimer
        </>
      )}
    </button>
  );
}