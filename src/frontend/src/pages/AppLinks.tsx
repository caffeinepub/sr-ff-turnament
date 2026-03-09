import { Check, Copy, ExternalLink, Shield, Users } from "lucide-react";
import { useState } from "react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      data-ocid="applinks.copy_button"
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-all duration-200 active:scale-95"
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? "Copied!" : "Copy Link"}
    </button>
  );
}

export default function AppLinks() {
  const baseUrl = window.location.origin;
  const userUrl = baseUrl;
  const adminUrl = `${baseUrl}/admin`;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-orange-400 mb-1">
            SR-FF-TOURNAMENT
          </h1>
          <p className="text-gray-400 text-sm">App Links</p>
        </div>

        {/* User App */}
        <div className="bg-gray-900 border border-orange-500/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500/20 p-2 rounded-lg">
              <Users size={20} className="text-orange-400" />
            </div>
            <div>
              <h2 className="text-white font-bold">User App</h2>
              <p className="text-gray-400 text-xs">Players ka panel</p>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
            <span className="text-cyan-400 text-sm truncate flex-1">
              {userUrl}
            </span>
            <a
              href={userUrl}
              target="_blank"
              rel="noreferrer"
              data-ocid="applinks.user_link"
            >
              <ExternalLink
                size={14}
                className="text-gray-400 hover:text-white"
              />
            </a>
          </div>
          <CopyButton text={userUrl} />
        </div>

        {/* Admin App */}
        <div className="bg-gray-900 border border-red-500/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/20 p-2 rounded-lg">
              <Shield size={20} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-white font-bold">Admin Panel</h2>
              <p className="text-gray-400 text-xs">Password: admin123</p>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
            <span className="text-cyan-400 text-sm truncate flex-1">
              {adminUrl}
            </span>
            <a
              href={adminUrl}
              target="_blank"
              rel="noreferrer"
              data-ocid="applinks.admin_link"
            >
              <ExternalLink
                size={14}
                className="text-gray-400 hover:text-white"
              />
            </a>
          </div>
          <CopyButton text={adminUrl} />
        </div>

        <p className="text-center text-gray-600 text-xs">
          © SR-FF-TOURNAMENT. All rights reserved.
        </p>
      </div>
    </div>
  );
}
