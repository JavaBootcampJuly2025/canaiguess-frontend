import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Image } from "lucide-react";

export default function GamePage() {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();

  const [batch, setBatch] = useState<any>(null);
  const [selected, setSelected] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Load first batch
  useEffect(() => {
    if (gameId) {
      fetchBatch();
    }
  }, [gameId]);

  const fetchBatch = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/game/${gameId}/batch`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setBatch(data);
        setSelected(null);
      } else {
        console.error("Failed to fetch batch:", await res.text());
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitGuess = async () => {
    if (selected === null) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/game/${gameId}/guess`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          guess: selected,
          batchId: batch.id,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.finished) {
          navigate(`/results/${gameId}`);
        } else {
          fetchBatch();
        }
      } else {
        console.error("Failed to submit guess:", await res.text());
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!batch) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading the good stuff...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Simple Header */}
      <div className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-2 text-xl font-bold">
          CanAIGuess
        </div>
      </div>

      {/* Game Batch Content */}
      <div className="flex flex-col items-center justify-center p-4 space-y-8">
        <Card className="w-full max-w-4xl border-border/50 backdrop-blur-sm bg-card/80">
          <CardHeader>
            <CardTitle className="text-xl">
              {batch.mode === "single" && (
                <div className="flex items-center space-x-2">
                  <Image className="w-5 h-5 text-ai-glow" />
                  <span>Single Image</span>
                </div>
              )}
              {/*{batch.mode === "pair" && (*/}
              {/*  <div className="flex items-center space-x-2">*/}
              {/*    <Images className="w-5 h-5 text-human-glow" />*/}
              {/*    <span>Image Pair</span>*/}
              {/*  </div>*/}
              {/*)}*/}
              {/*{batch.mode === "group" && (*/}
              {/*  <div className="flex items-center space-x-2">*/}
              {/*    <Grid3X3 className="w-5 h-5 text-neural-purple" />*/}
              {/*    <span>Image Group</span>*/}
              {/*  </div>*/}
              {/*)}*/}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {batch.images.map((img: any, index: number) => (
                <img
                  key={index}
                  src={img.url}
                  alt={`Image ${index + 1}`}
                  className="w-full rounded-lg border"
                />
              ))}
            </div>

            <RadioGroup value={selected} onValueChange={setSelected}>
              {batch.mode === "single" && (
                <div className="space-y-2">
                  <RadioGroupItem value="ai" id="ai" />
                  <label htmlFor="ai" className="ml-2">
                    AI Generated
                  </label>
                  <br />
                  <RadioGroupItem value="real" id="real" />
                  <label htmlFor="real" className="ml-2">
                    Real
                  </label>
                </div>
              )}

              {/*{batch.mode === "pair" && (*/}
              {/*  <div className="space-y-2">*/}
              {/*    {batch.images.map((img: any, index: number) => (*/}
              {/*      <div key={index}>*/}
              {/*        <RadioGroupItem value={index.toString()} id={`img-${index}`} />*/}
              {/*        <label htmlFor={`img-${index}`} className="ml-2">*/}
              {/*          Image {index + 1} is AI*/}
              {/*        </label>*/}
              {/*      </div>*/}
              {/*    ))}*/}
              {/*  </div>*/}
              {/*)}*/}

              {/*{batch.mode === "group" && (*/}
              {/*  <p className="text-muted-foreground text-sm">*/}
              {/*    (Implement multi-select for group mode as next step!)*/}
              {/*  </p>*/}
              {/*)}*/}
            </RadioGroup>

            <Button
              disabled={isLoading || selected === null}
              onClick={handleSubmitGuess}
              className="w-full bg-gradient-to-r from-ai-glow to-human-glow hover:opacity-90"
            >
              Submit Guess
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
