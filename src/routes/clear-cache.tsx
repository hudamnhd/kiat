import { Header } from "#src/components/custom/header";
import { Button } from "#src/components/ui/button";
import localforage from "localforage";
import { useFetcher, useNavigate } from "react-router";

export function Component() {
  const navigate = useNavigate();

  async function clearSiteData() {
    try {
      console.log("🧹 Membersihkan semua data situs...");

      // 🔥 1. Hapus LocalStorage & SessionStorage
      localStorage.clear();
      sessionStorage.clear();
      console.log("✅ LocalStorage & SessionStorage dibersihkan.");

      // 🔥 2. Hapus semua Cookie
      document.cookie.split(";").forEach((cookie) => {
        const [name] = cookie.split("=");
        document.cookie =
          `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      console.log("✅ Semua cookies dihapus.");

      // 🔥 3. Hapus LocalForage (IndexedDB)
      await localforage.clear();
      console.log("✅ LocalForage (IndexedDB) dibersihkan.");

      // 🔥 4. Hapus Cache API (Service Worker & Fetch Cache)
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
        console.log("✅ Cache API dibersihkan.");
      }

      window.location.href = "/";
      console.log("🎉 Semua data situs telah dibersihkan!");
    } catch (error) {
      console.error("❌ Gagal membersihkan data situs:", error);
    }
  }
  return (
    <div>
      <Header redirectTo="/" title="Reset data" />
      <div className="container-wrapper">
        <div className="container flex flex-col items-start gap-1 py-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]">
            Hapus Semua Data
          </h1>
          <p className="max-w-3xl text-lg font-light text-foreground mb-2">
            This will delete all data that has been saved.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onPress={clearSiteData}
              className="reset-button"
              variant="destructive"
            >
              Hapus Semua Data
            </Button>

            <Button onPress={() => navigate("/")} className="reset-button">
              Pergi Ke Halaman Utama
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
