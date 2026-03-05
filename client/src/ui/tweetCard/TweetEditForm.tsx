import type { FormEvent, ChangeEvent } from "react";
import { Button, Textarea, VStack, HStack } from "@chakra-ui/react";
import { MAX_TWEET_LENGTH, WARN_THRESHOLD } from "../../utils/tweet";

interface TweetEditFormProps {
  editContent: string;
  editLoading: boolean;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
}

export function TweetEditForm({ editContent, editLoading, onChange, onSubmit, onCancel }: TweetEditFormProps) {
  const counterClass = `tweet-card-edit-counter ${
    editContent.length > WARN_THRESHOLD ? "tweet-card-edit-counter--warn" : "tweet-card-edit-counter--normal"
  }`;
  const saveDisabled = editLoading || !editContent.trim();

  return (
    <form onSubmit={onSubmit}>
      <VStack align="stretch" gap={2} mt={1}>
        <Textarea
          value={editContent}
          onChange={onChange}
          maxLength={MAX_TWEET_LENGTH}
          resize="none"
          rows={2}
          size="sm"
        />
        <HStack justify="space-between">
          <span className={counterClass}>
            {editContent.length}/{MAX_TWEET_LENGTH}
          </span>
          <HStack gap={2}>
            <Button size="xs" variant="ghost" onClick={onCancel}>
              Annuler
            </Button>
            <Button size="xs" className="tweet-card-save-btn" type="submit" disabled={saveDisabled}>
              {editLoading ? "Envoi..." : "Enregistrer"}
            </Button>
          </HStack>
        </HStack>
      </VStack>
    </form>
  );
}
