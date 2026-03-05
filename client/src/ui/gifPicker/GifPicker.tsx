import { useState, useEffect, useRef, useCallback } from "react";
import { Box, Input, Text, Spinner } from "@chakra-ui/react";
import "./GifPicker.css";

const TENOR_API_KEY = "AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ";
const TENOR_BASE = "https://tenor.googleapis.com/v2";

interface TenorGif {
  id: string;
  title: string;
  media_formats: {
    tinygif: { url: string };
    gif: { url: string };
  };
}

interface GifPickerProps {
  onSelect: (url: string) => void;
  onCancel: () => void;
}

export default function GifPicker({ onSelect, onCancel }: GifPickerProps) {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<TenorGif[]>([]);
  const [loading, setLoading] = useState(false);
  const [next, setNext] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchGifs = useCallback(async (searchQuery: string, pos = "") => {
    setLoading(true);
    try {
      const endpoint = searchQuery.trim()
        ? `${TENOR_BASE}/search`
        : `${TENOR_BASE}/featured`;

      const params = new URLSearchParams({
        key: TENOR_API_KEY,
        client_key: "twipper",
        limit: "20",
        media_filter: "tinygif,gif",
      });

      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (pos) params.set("pos", pos);

      const res = await fetch(`${endpoint}?${params}`);
      const data = await res.json();

      if (pos) {
        setGifs((prev) => [...prev, ...(data.results || [])]);
      } else {
        setGifs(data.results || []);
      }
      setNext(data.next || "");
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  // Load featured GIFs on mount
  useEffect(() => {
    fetchGifs("");
  }, [fetchGifs]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchGifs(query);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchGifs]);

  // Infinite scroll
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el || loading || !next) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
      fetchGifs(query, next);
    }
  }, [loading, next, query, fetchGifs]);

  return (
    <Box className="gif-picker-overlay" onClick={onCancel}>
      <Box className="gif-picker" onClick={(e) => e.stopPropagation()}>
        <Text className="gif-picker-title">Choisir un GIF avatar</Text>
        <Input
          className="gif-picker-search"
          placeholder="Rechercher un GIF..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          size="sm"
          autoFocus
        />
        <Box
          className="gif-picker-grid"
          ref={containerRef}
          onScroll={handleScroll}
        >
          {gifs.map((gif) => (
            <img
              key={gif.id}
              src={gif.media_formats.tinygif.url}
              alt={gif.title}
              className="gif-picker-item"
              onClick={() => onSelect(gif.media_formats.gif.url)}
            />
          ))}
          {loading && (
            <Box className="gif-picker-loading">
              <Spinner size="sm" />
            </Box>
          )}
          {!loading && gifs.length === 0 && (
            <Text className="gif-picker-empty">Aucun GIF trouvé</Text>
          )}
        </Box>
        <Text className="gif-picker-powered">Powered by Tenor</Text>
      </Box>
    </Box>
  );
}
