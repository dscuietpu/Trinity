import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import AppShell from "../components/AppShell";
import { useToast } from "../components/ToastProvider";
import { getApiBaseUrl } from "../services/apiClient";
import { getCommunityById } from "../services/communityService";
import { getCommunityMessages, sendCommunityMessage } from "../services/messageService";

function ChatRoomPage() {
  const { id } = useParams();
  const [community, setCommunity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isChatLocked, setIsChatLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const socket = useMemo(() => io(getApiBaseUrl().replace("/api", "")), []);

  useEffect(() => {
    const load = async () => {
      try {
        const communityData = await getCommunityById(id);
        const messageData = await getCommunityMessages(id);
        setCommunity(communityData?.community || null);
        setMessages(messageData.messages || []);
        setIsChatLocked(Boolean(messageData.isChatLocked));
      } catch (err) {
        showToast(err.message || "Failed to load chat", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    socket.emit("community:join-room", { communityId: id });
    socket.on("community:new-message", (message) => {
      setMessages((prev) => [...prev, message]);
    });
    socket.on("community:message-updated", ({ message }) => {
      setMessages((prev) => prev.map((m) => (m._id === message._id ? message : m)));
    });
    socket.on("community:message-blocked", ({ reason }) => {
      showToast(reason || "Message blocked", "error");
    });
    return () => {
      socket.emit("community:leave-room", { communityId: id });
      socket.off("community:new-message");
      socket.off("community:message-updated");
      socket.off("community:message-blocked");
    };
  }, [id, showToast, socket]);

  const sendMessage = async () => {
    if (!text.trim() || isChatLocked) return;
    try {
      const created = await sendCommunityMessage(id, { content: text, type: "text" });
      setMessages((prev) => [...prev, created]);
      setText("");
    } catch (err) {
      showToast(err.message || "Failed to send message", "error");
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="rounded-3xl border border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl p-6 shadow-2xl">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">{community?.name || "Chat Room"}</h2>
          {loading && <p className="mt-2 text-sm text-slate-500 dark:text-zinc-500">Loading chat...</p>}
          {isChatLocked && (
            <p className="mt-3 rounded-xl border border-amber-200/50 dark:border-amber-900/30 bg-amber-50/80 dark:bg-amber-950/20 px-4 py-2.5 text-sm font-medium text-amber-700 dark:text-amber-400">
              🔒 Chat is read-only for this community.
            </p>
          )}
          <div className="mt-5 h-[460px] space-y-3 overflow-y-auto rounded-2xl border border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-black/40 p-4 scrollbar-thin">
            {!loading && messages.length === 0 && (
              <p className="rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-white/5 p-6 text-center text-sm font-medium text-slate-500 dark:text-zinc-500">
                No messages yet. Start the conversation.
              </p>
            )}
            {messages.map((msg) => (
              <div key={msg._id} className="rounded-2xl border border-slate-200/40 dark:border-white/5 bg-white/60 dark:bg-[#0a0a0a]/60 p-4 shadow-sm transition-all hover:bg-white/80 dark:hover:bg-white/5">
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">{msg.sender?.name || "User"}</p>
                <p className="text-sm font-medium text-slate-800 dark:text-zinc-200 leading-relaxed">{msg.content}</p>
                {msg.type === "video" && msg.mediaUrl && (
                  <div className="mt-3 overflow-hidden rounded-xl border border-slate-200/50 dark:border-white/5">
                    <video className="h-44 w-full object-cover" src={msg.mediaUrl} autoPlay muted loop playsInline />
                  </div>
                )}
                {msg.type === "image" && msg.mediaUrl && (
                  <div className="mt-3 overflow-hidden rounded-xl border border-slate-200/50 dark:border-white/5">
                    <img className="h-44 w-full object-cover" src={msg.mediaUrl} alt="message media" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <input
              className="flex-1 rounded-xl border border-slate-300 dark:border-zinc-800 bg-white/50 dark:bg-black/50 px-4 py-3 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500"
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={isChatLocked}
            />
            <button
              className="rounded-xl bg-slate-900 dark:bg-zinc-100 px-6 py-3 font-bold text-white dark:text-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
              onClick={sendMessage}
              disabled={isChatLocked}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default ChatRoomPage;
