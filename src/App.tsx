import { useState, useEffect, useRef } from 'react';
import type { EventDetails, EventStats, Guest, ActivityEvent, HotelRoom } from './types/wedding';
import { HostDashboard } from './components/HostDashboard';
import { GuestRSVP } from './components/GuestRSVP';
import { Smartphone, X } from 'lucide-react';

// Web Audio API chime for live incoming RSVPs
function playChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(440, now);
    osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.55);
    osc2.stop(now + 0.55);
  } catch (e) {
    // Audio context not allowed or blocked
  }
}

export function App() {
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [rooms, setRooms] = useState<HotelRoom[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [previewGuest, setPreviewGuest] = useState<Guest | null>(null);
  const [liveToast, setLiveToast] = useState<{ name: string; text: string } | null>(null);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  const handleEnablePushNotifications = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setPushPermission(perm);
        if (perm === 'granted') {
          new Notification('🔔 Wedding Admin Alerts Active', {
            body: 'You will receive instant alerts whenever guests RSVP or change their arrival time.',
          });
        }
      } catch (e) {
        console.warn('Could not request notification permission', e);
      }
    }
  };

  // Check if current URL is a guest magic link (e.g. ?guest=sharma-fam-4)
  const urlParams = new URLSearchParams(window.location.search);
  const guestTokenFromUrl = urlParams.get('guest');
  const [standaloneGuest, setStandaloneGuest] = useState<Guest | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  // Initial Data Fetch
  const fetchData = async () => {
    try {
      const res = await fetch('/api/event');
      if (res.ok) {
        const data = await res.json();
        setEvent(data.event);
        setStats(data.stats);
        setActivities(data.activities);
        if (data.rooms) setRooms(data.rooms);
      }

      const guestsRes = await fetch('/api/guests');
      if (guestsRes.ok) {
        const guestsData: Guest[] = await guestsRes.json();
        setGuests(guestsData);
        if (guestsData.length > 0 && !previewGuest) {
          setPreviewGuest(guestsData[0]);
        }

        // Check if token in URL matches a guest
        if (guestTokenFromUrl) {
          const matched = guestsData.find(
            (g) => g.magicToken === guestTokenFromUrl || g.id === guestTokenFromUrl
          );
          if (matched) {
            setStandaloneGuest(matched);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching event data', err);
    }
  };

  // WebSocket Connection for Realtime Sync
  useEffect(() => {
    fetchData();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    function connectWs() {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to Realtime WebSocket');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          console.log('⚡ Realtime WS Message:', msg.type);

          if (msg.type === 'INIT') {
            setEvent(msg.data.event);
            setGuests(msg.data.guests);
            setActivities(msg.data.activities);
            if (msg.data.rooms) setRooms(msg.data.rooms);
            setStats(msg.stats);
            if (msg.data.guests.length > 0 && !previewGuest) {
              setPreviewGuest(msg.data.guests[0]);
            }
          } else if (msg.type === 'RSVP_UPDATED') {
            const { guest, activity } = msg.data;
            if (soundEnabled) playChime();

            // Trigger system desktop/mobile push notification if enabled
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                const title = guest.status === 'confirmed'
                  ? `✅ RSVP: ${guest.name} (${guest.attendingCount} pax)`
                  : `❌ RSVP Regret: ${guest.name}`;
                const body = guest.status === 'confirmed'
                  ? `${guest.vegCount} Veg, ${guest.nonVegCount} Non-Veg • Arriving ${guest.arrivalTime}`
                  : `Guest indicated they cannot attend. Headcount released.`;
                new Notification(title, { body });
              } catch (e) {
                console.warn('Push notification failed', e);
              }
            }

            // Update guests list
            setGuests((prev) =>
              prev.map((g) => (g.id === guest.id ? guest : g))
            );

            // Update preview guest if same
            setPreviewGuest((prev) => (prev && prev.id === guest.id ? guest : prev));

            // Update activities
            if (activity) {
              setActivities((prev) => [activity, ...prev.slice(0, 29)]);
              setLiveToast({
                name: guest.name,
                text: guest.status === 'confirmed' ? `Confirmed ${guest.attendingCount} guests!` : 'Sent regrets',
              });
              setTimeout(() => setLiveToast(null), 4000);
            }

            if (msg.stats) {
              setStats(msg.stats);
            }
          } else if (msg.type === 'GUEST_ADDED') {
            const { guest, activity } = msg.data;
            setGuests((prev) => [guest, ...prev]);
            if (activity) setActivities((prev) => [activity, ...prev]);
            if (msg.stats) setStats(msg.stats);
          } else if (msg.type === 'ROOM_UPDATED') {
            if (msg.data.rooms) setRooms(msg.data.rooms);
          } else if (msg.type === 'EVENT_UPDATED') {
            setEvent(msg.data.event);
            if (msg.stats) setStats(msg.stats);
          } else if (msg.type === 'ACTIVITY_ADDED') {
            if (msg.data.activity) {
              setActivities((prev) => [msg.data.activity, ...prev.slice(0, 29)]);
              if (soundEnabled) playChime();
              setLiveToast({
                name: msg.data.activity.guestName,
                text: msg.data.activity.description,
              });
              setTimeout(() => setLiveToast(null), 4000);
            }
          } else if (msg.type === 'RESET') {
            setEvent(msg.data.event);
            setGuests(msg.data.guests);
            setActivities(msg.data.activities);
            if (msg.data.rooms) setRooms(msg.data.rooms);
            setStats(msg.stats);
            if (msg.data.guests.length > 0) setPreviewGuest(msg.data.guests[0]);
          }
        } catch (err) {
          console.error('Error parsing WS message', err);
        }
      };

      ws.onclose = () => {
        console.log('WS connection closed. Reconnecting in 2s...');
        setIsConnected(false);
        setTimeout(connectWs, 2000);
      };

      ws.onerror = (err) => {
        console.error('WS Error', err);
        ws.close();
      };
    }

    connectWs();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [guestTokenFromUrl, soundEnabled]);

  // Actions
  const handleRSVPSubmit = async (rsvpData: any) => {
    const res = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rsvpData),
    });
    if (!res.ok) throw new Error('RSVP update failed');
  };

  const handleSimulateRSVP = async () => {
    await fetch('/api/simulate', { method: 'POST' });
  };

  const handleResetData = async () => {
    if (confirm('Reset demo data to initial Indian wedding guest list?')) {
      await fetch('/api/reset', { method: 'POST' });
    }
  };

  const handleAddGuest = async (guestData: any) => {
    const res = await fetch('/api/guest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(guestData),
    });
    if (!res.ok) throw new Error('Add guest failed');
  };

  const handleAssignRoom = async (roomId: string, guestId: string | null, guestName: string | null) => {
    await fetch('/api/rooms/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, guestId, guestName }),
    });
  };

  const handleUpdateCostPerPlate = async (cost: number) => {
    await fetch('/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ costPerPlate: cost }),
    });
  };

  // If loading
  if (!event || !stats) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-full royal-wax-seal text-amber-200 border border-amber-400/50 flex items-center justify-center font-serif text-2xl font-black shadow-2xl animate-pulse">
          A&amp;R
        </div>
        <div className="text-xs tracking-[0.3em] uppercase font-black gold-foil-text">
          Loading Royal Wedding Guest Command Center...
        </div>
      </div>
    );
  }

  // If user opened a specific guest magic link directly on phone or browser:
  if (standaloneGuest) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#08080c] via-[#0f0f15] to-black py-8 px-4 flex items-center justify-center">
        <GuestRSVP
          guest={standaloneGuest}
          event={event}
          onSubmitRSVP={handleRSVPSubmit}
          isStandalone={true}
        />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Realtime Toast Alert */}
      {liveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-950 text-white px-5 py-3 rounded-2xl shadow-2xl border border-neutral-800 flex items-center gap-3 animate-slide-up">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
          <div className="text-xs">
            <span className="font-bold text-white">{liveToast.name}</span>{' '}
            <span className="text-neutral-400 font-medium">• {liveToast.text}</span>
          </div>
        </div>
      )}

      {/* Main Container: Host Dashboard with optional Split-Screen Mobile Simulator */}
      <div className="flex flex-col xl:flex-row">
        {/* Host Dashboard */}
        <div className={`flex-1 transition-all duration-300 ${showMobilePreview ? 'xl:pr-[440px]' : ''}`}>
          <HostDashboard
            event={event}
            stats={stats}
            guests={guests}
            activities={activities}
            rooms={rooms}
            isConnected={isConnected}
            soundEnabled={soundEnabled}
            pushPermission={pushPermission}
            onEnablePushNotifications={handleEnablePushNotifications}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
            onSimulateRSVP={handleSimulateRSVP}
            onResetData={handleResetData}
            onAddGuest={handleAddGuest}
            onAssignRoom={handleAssignRoom}
            onSelectGuestForPreview={(g) => {
              setPreviewGuest(g);
              setShowMobilePreview(true);
            }}
            onToggleMobilePreview={() => setShowMobilePreview(!showMobilePreview)}
            showMobilePreview={showMobilePreview}
            onUpdateCostPerPlate={handleUpdateCostPerPlate}
          />
        </div>

        {/* Floating / Docked iPhone Mockup Frame */}
        {showMobilePreview && previewGuest && (
          <aside className="fixed top-0 right-0 w-[440px] h-screen bg-neutral-900/90 backdrop-blur-md border-l border-neutral-800 z-50 p-6 flex flex-col justify-center items-center shadow-2xl animate-fade-in overflow-hidden">
            {/* Top Toolbar of Simulator */}
            <div className="w-full flex items-center justify-between text-neutral-300 text-xs mb-3 px-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Guest Mobile Simulator</span>
              </div>
              <button
                onClick={() => setShowMobilePreview(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Guest Selector Dropdown in Simulator */}
            <div className="w-full mb-3">
              <select
                value={previewGuest.id}
                onChange={(e) => {
                  const found = guests.find((g) => g.id === e.target.value);
                  if (found) setPreviewGuest(found);
                }}
                className="w-full bg-neutral-800 text-white text-xs px-3 py-2 rounded-xl border border-neutral-700 focus:outline-none"
              >
                {guests.map((g) => (
                  <option key={g.id} value={g.id}>
                    Simulate: {g.name} ({g.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* iPhone Frame Shell */}
            <div className="relative w-[375px] h-[680px] bg-black rounded-[48px] p-2.5 shadow-[0_0_50px_rgba(245,158,11,0.2)] border-4 border-amber-500/40 flex flex-col overflow-hidden ring-1 ring-neutral-800">
              {/* iPhone Notch / Island */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-center border border-neutral-800/80">
                <div className="w-3 h-3 rounded-full bg-neutral-900 border border-neutral-800 mr-2" />
                <div className="w-2 h-2 rounded-full bg-neutral-900" />
              </div>

              {/* Screen Inner Viewport */}
              <div className="w-full h-full bg-black rounded-[38px] overflow-y-auto relative">
                <GuestRSVP
                  key={previewGuest.id}
                  guest={previewGuest}
                  event={event}
                  onSubmitRSVP={handleRSVPSubmit}
                  onBackToDashboard={() => setShowMobilePreview(false)}
                />
              </div>
            </div>

            <div className="text-[11px] text-neutral-400 mt-3 text-center">
              Submit on this phone to watch the Host Dashboard update live!
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default App;
