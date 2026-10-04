import { useRef, useState } from "react";

const categories = [
  "Professional",
  "Editorial",
  "Cinematic",
  "Portrait",
  "Skin Retouch",
  "Body Shape",
  "Background",
  "Color",
  "Black & White"
];

function App() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("Professional");
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleUpload = (file?: File) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setImage(reader.result as string);
      setResult(null);
    };

    reader.readAsDataURL(file);
  };

  const handleEdit = async () => {
    if (!image) return;

    setIsProcessing(true);

    try {
      const response = await fetch("/api/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          image,
          category: selectedCategory,
          prompt
        })
      });

      if (!response.ok) {
        throw new Error("Image editing failed");
      }

      const data = await response.json();

      if (data.image) {
        setResult(data.image);
      }
    } catch (error) {
      console.error(error);
      alert("Editarea fotografiei a eșuat.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!result) return;

    const link = document.createElement("a");
    link.href = result;
    link.download = "ai-photo-studio-pro.png";
    link.click();
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>AI Photo Studio Pro</h1>
          <p>Professional AI Photo Editing</p>
        </div>

        <div className="status">
          AI Studio
        </div>
      </header>

      <main className="main">
        {!image ? (
          <section className="upload-card">
            <div className="upload-icon">＋</div>

            <h2>Upload Photo</h2>

            <p>
              Select a photo and transform it with professional AI editing.
            </p>

            <button
              className="primary-button"
              onClick={() => inputRef.current?.click()}
            >
              Choose Photo
            </button>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(event) =>
                handleUpload(event.target.files?.[0])
              }
            />
          </section>
        ) : (
          <section className="studio">
            <div className="preview-grid">
              <div className="preview-card">
                <span>Original</span>
                <img src={image} alt="Original" />
              </div>

              <div className="preview-card">
                <span>AI Result</span>

                {result ? (
                  <img src={result} alt="AI Result" />
                ) : (
                  <div className="empty-result">
                    {isProcessing
                      ? "AI is processing..."
                      : "Your edited photo will appear here"}
                  </div>
                )}
              </div>
            </div>

            <div className="controls">
              <h2>AI Editing</h2>

              <div className="categories">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={
                      selectedCategory === category
                        ? "category active"
                        : "category"
                    }
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Describe the edit you want..."
              />

              <div className="actions">
                <button
                  className="secondary-button"
                  onClick={() => {
                    setImage(null);
                    setResult(null);
                    setPrompt("");
                  }}
                >
                  New Photo
                </button>

                <button
                  className="primary-button"
                  disabled={isProcessing}
                  onClick={handleEdit}
                >
                  {isProcessing ? "Processing..." : "✨ Edit with AI"}
                </button>

                {result && (
                  <button
                    className="secondary-button"
                    onClick={downloadImage}
                  >
                    Download
                  </button>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      <footer>
        AI Photo Studio Pro · Professional AI Image Editing
      </footer>
    </div>
  );
}

export default App;
