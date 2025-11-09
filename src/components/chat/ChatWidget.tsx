import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActionIcon,
  Paper,
  Text,
  Textarea,
  Group,
  Button,
  ScrollArea,
  Avatar,
  Badge,
  Tooltip,
  Divider,
} from "@mantine/core";
import { IconMessageCircle2, IconSend, IconX } from "@tabler/icons-react";
import { CHAT_EVENTS, type ChatPeer } from "@/lib/chat";
import { useNavigate } from "react-router-dom";

type MsgSender = "user" | "bot";
interface ChatMessage {
  id: string;
  sender: MsgSender;
  text: string;
  ts: number;
}

export const ChatWidget = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: crypto.randomUUID(),
      sender: "bot",
      text: "Hi there! How can I help you today?",
      ts: Date.now(),
    },
  ]);
  const [suggestions] = useState<string[]>(["Add project", "Find vendor"]);
  const [peer, setPeer] = useState<ChatPeer | null>(null);

  const scrollToBottom = () => {
    try {
      const el = viewportRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, open]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text,
      ts: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setBusy(true);

    // Dummy bot response
    setTimeout(() => {
      const reply: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "bot",
        text: "Thanks! I noted that. You can also tap a quick action above for common tasks.",
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, reply]);
      setBusy(false);
    }, 700);
  };

  // Listen for open-chat events dispatched from anywhere in the app
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ peer?: ChatPeer }>;
      const p = ce.detail?.peer;
      if (p) setPeer(p);
      setOpen(true);
      setTimeout(scrollToBottom, 0);
    };
    window.addEventListener(CHAT_EVENTS.EVENT_NAME, handler as EventListener);
    return () =>
      window.removeEventListener(
        CHAT_EVENTS.EVENT_NAME,
        handler as EventListener
      );
  }, []);

  return (
    <>
      {/* Floating button */}
      <div className="fixed right-4 bottom-4 z-[60]">
        <Tooltip label={open ? "Hide Assistant" : "Chat with R-OS"} withArrow>
          <ActionIcon
            size="xl"
            radius="xl"
            variant="filled"
            color="blue"
            onClick={() => setOpen((v) => !v)}
            aria-label="Open chat"
            className="shadow-md"
          >
            <IconMessageCircle2 size={22} />
          </ActionIcon>
        </Tooltip>
      </div>

      {/* Chat panel */}
      {open && (
        <div className="fixed right-4 bottom-20 z-[60] w-[92vw] max-w-[400px]">
          <Paper
            withBorder
            shadow="xl"
            radius="lg"
            className="bg-white border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b bg-white">
              <div className="flex items-center gap-3">
                {peer?.avatar ? (
                  <Avatar size={28} radius="xl" src={peer.avatar} />
                ) : (
                  <Avatar size={28} radius="xl" color="blue">
                    R
                  </Avatar>
                )}
                <div className="leading-tight">
                  <Text fw={700} size="sm" c="#111827">
                    {peer?.name || "R-OS Assistant"}
                  </Text>
                  <Group gap={6}>
                    <Badge size="xs" color="green" variant="light">
                      Online
                    </Badge>
                    <Text size="xs" c="dimmed">
                      {peer?.type === "vendor" ? "Vendor chat" : "Assistant"}
                    </Text>
                  </Group>
                </div>
              </div>
              <ActionIcon
                variant="subtle"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
              >
                <IconX size={18} />
              </ActionIcon>
            </div>

            {/* Quick actions */}
            <div className="px-3 pt-2">
              <Group gap={6} className="flex-wrap">
                {suggestions.map((s) => (
                  <Button
                    key={s}
                    size="xs"
                    variant="light"
                    color="gray"
                    className="rounded-full"
                    onClick={() => {
                      const key = s.trim().toLowerCase();
                      if (key === "add project") {
                        navigate("/territory/project");
                        setOpen(false);
                        return;
                      }
                      if (key === "find vendor") {
                        navigate("/territory/vendor");
                        setOpen(false);
                        return;
                      }

                      setInput(s);
                    }}
                  >
                    {s}
                  </Button>
                ))}
              </Group>
            </div>

            {/* Messages */}
            <div className="h-[58vh] max-h-[420px] overflow-hidden">
              <ScrollArea.Autosize
                mah={420}
                viewportRef={viewportRef}
                className="px-3 py-2"
              >
                <div className="flex flex-col gap-3">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex items-end gap-2 ${
                        m.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {m.sender === "bot" && (
                        <Avatar size={24} radius="xl" color="blue">
                          R
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[78%] rounded-2xl px-3 py-2 text-[13px] shadow-sm ${
                          m.sender === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-50 border border-gray-200 text-gray-800"
                        }`}
                      >
                        {m.text}
                        <div
                          className={`mt-1 text-[10px] ${
                            m.sender === "user"
                              ? "text-white/80"
                              : "text-gray-500"
                          }`}
                        >
                          {new Date(m.ts).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      {m.sender === "user" && (
                        <Avatar size={24} radius="xl" color="gray">
                          U
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {busy && (
                    <div className="flex items-end gap-2">
                      <Avatar size={24} radius="xl" color="blue">
                        R
                      </Avatar>
                      <div className="bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 text-[13px] text-gray-700 shadow-sm">
                        <span className="inline-flex gap-1 items-center">
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                            style={{ animationDelay: "120ms" }}
                          />
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                            style={{ animationDelay: "240ms" }}
                          />
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea.Autosize>
            </div>

            {/* Input */}
            <div className="border-t p-2 bg-white">
              <Group gap="xs" align="end">
                <Textarea
                  autosize
                  minRows={1}
                  maxRows={4}
                  placeholder={
                    peer?.name ? `Message ${peer.name}…` : "Type your message…"
                  }
                  className="flex-1"
                  value={input}
                  onChange={(e) => setInput(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  loading={busy}
                  leftSection={<IconSend size={16} />}
                  variant="filled"
                  color="blue"
                  className="rounded-md"
                >
                  Send
                </Button>
              </Group>
            </div>
          </Paper>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
