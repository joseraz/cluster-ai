import { useState, useCallback, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';
import { useContacts } from '@/contexts/ContactsContext';
import { serializeContacts } from '@/lib/serializeContacts';
import { useToast } from '@/hooks/use-toast';

const AGENT_ID = 'agent_7001ks75szwmeb0ba6hebre88k73';

export type MrFoxStatus = 'idle' | 'connecting' | 'connected' | 'error';

export function useMrFox() {
  const { contacts } = useContacts();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [foxStatus, setFoxStatus] = useState<MrFoxStatus>('idle');
  const contactsRef = useRef(contacts);
  contactsRef.current = contacts; // keep ref fresh without re-creating callbacks

  // @elevenlabs/react v1.6.3: useConversation must be used inside a
  // ConversationProvider (added to App.tsx). startSession/endSession are void.
  const conversation = useConversation({
    onConnect: () => {
      setFoxStatus('connected');
      // TODO(privacy): migrate to client tools so the full contact list never
      // leaves the browser. For the MVP demo, we inject the full serialised
      // contact list as a non-interrupting contextual update.
      const snapshot = serializeContacts(contactsRef.current);
      conversation.sendContextualUpdate(
        `CONTACT DATABASE SNAPSHOT — use this data to answer the user's questions. ` +
        `Do not invent contacts or information that is not present here.\n\n${snapshot}`
      );
    },
    onDisconnect: () => {
      setFoxStatus('idle');
      setIsOpen(false);
    },
    onError: (error) => {
      console.error('[MrFox] conversation error', error);
      setFoxStatus('error');
      setIsOpen(false);
      toast({
        title: 'Mr. Fox disconnected',
        description: 'There was a problem connecting to the assistant. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const open = useCallback(async () => {
    // Request microphone permission before starting session
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      toast({
        title: 'Microphone access required',
        description: 'Please allow microphone access to talk to Mr. Fox.',
        variant: 'destructive',
      });
      return;
    }

    setIsOpen(true);
    setFoxStatus('connecting');

    // startSession is void in @elevenlabs/react v1.6.3 — errors arrive via onError
    conversation.startSession({
      agentId: AGENT_ID,
      connectionType: 'webrtc',
    });
  }, [conversation, toast]);

  const close = useCallback(() => {
    // endSession is void in @elevenlabs/react v1.6.3
    conversation.endSession();
    setFoxStatus('idle');
    setIsOpen(false);
  }, [conversation]);

  return {
    isOpen,
    open,
    close,
    foxStatus,
    isSpeaking: conversation.isSpeaking,
  };
}
