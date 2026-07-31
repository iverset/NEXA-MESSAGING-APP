export interface FAQItem {
  id: number;
  category: string;
  question: string;
  steps: string[];
}

export const FAQ_CATEGORIES = [
  'All',
  'Account & Profile',
  'Security & Privacy',
  'Chats & Messages',
  'Voice & Video Calls',
  'Archiving & Pinning',
  'Folders & Channels',
  'Multi-Device & Web',
  'Translation & Languages',
  'Data & Storage',
  'Troubleshooting',
] as const;

export const ALL_FAQS: FAQItem[] = [
  // --- Category: Account & Profile (1-10) ---
  {
    id: 1,
    category: 'Account & Profile',
    question: 'How do I edit my profile name, bio, and username?',
    steps: [
      'Open the left Navigation Rail or main menu and click on Settings.',
      'Tap on Edit Profile / My Account at the top of the menu.',
      'Enter your preferred Display Name, Username, and Bio text.',
      'Click Save Changes to update your profile across all connected devices instantly.',
    ],
  },
  {
    id: 2,
    category: 'Account & Profile',
    question: 'How do I change my profile picture or generate an AI avatar?',
    steps: [
      'Navigate to Settings > Edit Profile.',
      'Click on your current avatar photo or the Camera icon overlay.',
      'Choose between uploading a photo, choosing from preset avatars, or tapping Generate AI Avatar.',
      'Confirm your selection to update your global profile picture.',
    ],
  },
  {
    id: 3,
    category: 'Account & Profile',
    question: 'Who can see my profile photo and online status?',
    steps: [
      'Go to Settings > Privacy & Security.',
      'Select Profile Photo Visibility.',
      'Choose between "Everyone", "My Contacts", "My Contacts Except...", or "Nobody".',
      'Toggle Last Seen & Online status visibility as preferred.',
    ],
  },
  {
    id: 4,
    category: 'Account & Profile',
    question: 'How do I change my registered phone number?',
    steps: [
      'Go to Settings > My Account.',
      'Tap on Phone Number and select Change Number.',
      'Enter your new phone number and request verification code.',
      'Type the 6-digit confirmation code to complete number transfer.',
    ],
  },
  {
    id: 5,
    category: 'Account & Profile',
    question: 'How do I delete or deactivate my NEXA account?',
    steps: [
      'Navigate to Settings > Privacy & Security.',
      'Scroll to the bottom and select Account Deletion.',
      'Review the warning regarding permanent loss of chats and cloud messages.',
      'Confirm with your account password or PIN to finalize deletion.',
    ],
  },
  {
    id: 6,
    category: 'Account & Profile',
    question: 'How do I set up a custom status message?',
    steps: [
      'Open the Stories/Status panel from the side navigation or main list.',
      'Tap on "My Status" or click the Camera / Plus icon.',
      'Type your status text or attach media with a caption.',
      'Publish your status update; it will be visible to contacts for 24 hours.',
    ],
  },
  {
    id: 7,
    category: 'Account & Profile',
    question: 'How do I hide my bio from non-contacts?',
    steps: [
      'Open Settings > Privacy & Security.',
      'Select About / Bio Privacy.',
      'Set the visibility setting to "My Contacts".',
    ],
  },
  {
    id: 8,
    category: 'Account & Profile',
    question: 'Can I use NEXA without a phone number?',
    steps: [
      'You can create and share a unique NEXA Username.',
      'Users can search and initiate chats using your username without seeing your phone number.',
      'Ensure phone number privacy is set to "Nobody" in Privacy Settings.',
    ],
  },
  {
    id: 9,
    category: 'Account & Profile',
    question: 'How do I view my saved account details and sessions?',
    steps: [
      'Go to Settings > Devices & Sessions.',
      'View all active devices currently logged into your account.',
      'Click Terminate Session on any recognized or unrecognized device.',
    ],
  },
  {
    id: 10,
    category: 'Account & Profile',
    question: 'How do I copy my direct profile chat link to share with others?',
    steps: [
      'Go to Settings > Edit Profile.',
      'Click on your unique handle/username (e.g., @alex_nexa).',
      'Tap "Copy Profile Link" to share your direct messaging URL with external contacts.',
    ],
  },

  // --- Category: Security & Privacy (11-20) ---
  {
    id: 11,
    category: 'Security & Privacy',
    question: 'How do I enable Passcode Lock for NEXA?',
    steps: [
      'Go to Settings > Privacy & Security.',
      'Click "Enable Passcode Lock".',
      'Enter a 4-digit or 6-digit numeric PIN code.',
      'Set auto-lock timer (e.g., Immediately, 1 Minute, 1 Hour).',
    ],
  },
  {
    id: 12,
    category: 'Security & Privacy',
    question: 'How do Two-Step Verification (2FA) work in NEXA?',
    steps: [
      'Navigate to Settings > Privacy & Security > Two-Step Verification.',
      'Create a master password that will be required whenever you log in on a new device.',
      'Provide a recovery email address in case you forget your password.',
    ],
  },
  {
    id: 13,
    category: 'Security & Privacy',
    question: 'How do I block and unblock suspicious users?',
    steps: [
      'Open the chat with the user or open their contact profile.',
      'Click the 3-dot menu at the top right and select "Block User".',
      'To manage blocked list, go to Settings > Privacy & Security > Blocked Contacts.',
    ],
  },
  {
    id: 14,
    category: 'Security & Privacy',
    question: 'How do I disable read receipts (double blue checkmarks)?',
    steps: [
      'Open Settings > Privacy & Security.',
      'Toggle off "Read Receipts".',
      'Note: Disabling read receipts will also prevent you from seeing read receipts from others.',
    ],
  },
  {
    id: 15,
    category: 'Security & Privacy',
    question: 'How do I prevent strangers from adding me to groups?',
    steps: [
      'Go to Settings > Privacy & Security > Group Permissions.',
      'Change "Who can add me to groups" from "Everyone" to "My Contacts".',
    ],
  },
  {
    id: 16,
    category: 'Security & Privacy',
    question: 'Are messages end-to-end encrypted on NEXA?',
    steps: [
      'All private one-on-one chats and voice/video calls use high-grade end-to-end encryption.',
      'Encryption keys are generated directly on client devices.',
      'No intermediary server or third party can read your messages.',
    ],
  },
  {
    id: 17,
    category: 'Security & Privacy',
    question: 'How do I report spam or abusive channels?',
    steps: [
      'Open the channel or group profile.',
      'Click the top-right 3-dot options menu.',
      'Select "Report Channel" and choose the reason (Spam, Violence, Copyright, Fake).',
    ],
  },
  {
    id: 18,
    category: 'Security & Privacy',
    question: 'How do I clear local cache without deleting chat messages?',
    steps: [
      'Go to Settings > Data & Storage.',
      'Click "Clear Temporary Cache".',
      'This removes downloaded media thumbnails while preserving all text message databases.',
    ],
  },
  {
    id: 19,
    category: 'Security & Privacy',
    question: 'How do I turn on Secret Chat with self-destructing messages?',
    steps: [
      'Open a contact profile and tap "Start Secret Chat".',
      'Click the Timer icon in the header to set self-destruct countdown (from 5 seconds to 1 week).',
      'Messages automatically delete from both devices after being viewed.',
    ],
  },
  {
    id: 20,
    category: 'Security & Privacy',
    question: 'How do I check if my account is logged in elsewhere?',
    steps: [
      'Navigate to Settings > Devices & Sessions.',
      'Review IP addresses, device names, and location logs.',
      'Tap "Terminate All Other Sessions" if you notice unknown access.',
    ],
  },

  // --- Category: Chats & Messages (21-30) ---
  {
    id: 21,
    category: 'Chats & Messages',
    question: 'How do I edit a message I already sent?',
    steps: [
      'Long-press or right-click the message you sent within 15 minutes of sending.',
      'Select "Edit" from the action menu.',
      'Modify the text and tap the checkmark button to update.',
    ],
  },
  {
    id: 22,
    category: 'Chats & Messages',
    question: 'How do I delete a message for everyone?',
    steps: [
      'Select the message by long-pressing or clicking it.',
      'Click the Delete (Trash) icon.',
      'Choose "Delete for Everyone" to remove it from all participants’ devices.',
    ],
  },
  {
    id: 23,
    category: 'Chats & Messages',
    question: 'How do I peek at messages without marking them as read?',
    steps: [
      'In the chat list, long-press the avatar of the contact.',
      'A preview window pops up showing recent messages without triggering read receipts.',
      'Release your finger or click outside to dismiss the peek window.',
    ],
  },
  {
    id: 24,
    category: 'Chats & Messages',
    question: 'How do I reply directly to a specific message?',
    steps: [
      'Swipe right on any message bubble, or hover and click the Reply arrow.',
      'The target message appears pinned above your composer input.',
      'Type your message and send.',
    ],
  },
  {
    id: 25,
    category: 'Chats & Messages',
    question: 'How do I send voice messages in NEXA?',
    steps: [
      'In any chat composer, tap and hold the Microphone icon.',
      'Speak your message.',
      'Release to send instantly, or swipe left to cancel recording.',
    ],
  },
  {
    id: 26,
    category: 'Chats & Messages',
    question: 'How do I send media attachments and documents?',
    steps: [
      'Click the Attachment (Paperclip) icon in the chat composer.',
      'Select photos, videos, audio files, or PDF documents.',
      'Add an optional caption and hit send.',
    ],
  },
  {
    id: 27,
    category: 'Chats & Messages',
    question: 'How do I star or bookmark important messages?',
    steps: [
      'Click or long-press on any message.',
      'Select "Star Message" from the context menu.',
      'Access all starred messages anytime via Navigation Rail > Starred Messages.',
    ],
  },
  {
    id: 28,
    category: 'Chats & Messages',
    question: 'How do I use message reactions with emojis?',
    steps: [
      'Hover over a message bubble or long-press it.',
      'Select a reaction emoji from the reaction bar below or above the bubble.',
      'Tap the reaction again to remove it.',
    ],
  },
  {
    id: 29,
    category: 'Chats & Messages',
    question: 'How do I search within a specific chat history?',
    steps: [
      'Open the target chat thread.',
      'Click the Search (Magnifying glass) icon in the chat top header.',
      'Type keywords to jump directly to matching messages.',
    ],
  },
  {
    id: 30,
    category: 'Chats & Messages',
    question: 'How do I format text with bold, italic, or code blocks?',
    steps: [
      'For bold: wrap text in asterisks like *bold*.',
      'For italic: wrap text in underscores like _italic_.',
      'For monospace code: wrap text in backticks like `code`.',
    ],
  },

  // --- Category: Voice & Video Calls (31-40) ---
  {
    id: 31,
    category: 'Voice & Video Calls',
    question: 'How do I start a 1-on-1 voice or video call?',
    steps: [
      'Open the chat with your target contact.',
      'Click the Phone icon for Voice Call, or Video Camera icon for Video Call in the header.',
      'Wait for the contact to accept the incoming call.',
    ],
  },
  {
    id: 32,
    category: 'Voice & Video Calls',
    question: 'How do I start a group voice call or live audio room?',
    steps: [
      'Open any group chat thread.',
      'Click the Voice Chat button at the top header.',
      'Group members will receive an invitation banner to join the live audio room.',
    ],
  },
  {
    id: 33,
    category: 'Voice & Video Calls',
    question: 'How do I share my screen during a video call?',
    steps: [
      'While in an active video call, tap the Screen Share icon on the call control bar.',
      'Select whether to share your entire screen or a specific window.',
      'Click Share to broadcast your screen to participants.',
    ],
  },
  {
    id: 34,
    category: 'Voice & Video Calls',
    question: 'How do I switch camera or microphone input source during a call?',
    steps: [
      'During an active call, tap Settings (Gear) icon on the call overlay.',
      'Choose your preferred camera device, microphone, or audio output speaker.',
    ],
  },
  {
    id: 35,
    category: 'Voice & Video Calls',
    question: 'How do I mute my microphone or turn off video?',
    steps: [
      'Tap the Microphone icon to mute/unmute audio.',
      'Tap the Camera icon to turn video feed on/off.',
    ],
  },
  {
    id: 36,
    category: 'Voice & Video Calls',
    question: 'Does NEXA support call recording?',
    steps: [
      'Group audio voice rooms can be recorded by group administrators.',
      'Participants receive a visual recording indicator badge when recording is active.',
    ],
  },
  {
    id: 37,
    category: 'Voice & Video Calls',
    question: 'Why is my call audio quality low or choppy?',
    steps: [
      'Check your Wi-Fi or cellular network connection.',
      'Go to Settings > Data & Storage > Call Data Usage.',
      'Enable "Low Data Mode for Calls" if operating on weak cellular data.',
    ],
  },
  {
    id: 38,
    category: 'Voice & Video Calls',
    question: 'Can I place calls on NEXA Web desktop browser?',
    steps: [
      'Yes! NEXA Web supports full WebRTC browser-based voice and video calling.',
      'Ensure you grant browser camera and microphone permissions when prompted.',
    ],
  },
  {
    id: 39,
    category: 'Voice & Video Calls',
    question: 'How do I adjust call ringtone volume?',
    steps: [
      'Go to Settings > Notifications & Sounds.',
      'Adjust the Call Volume slider and choose custom ringtone tones.',
    ],
  },
  {
    id: 40,
    category: 'Voice & Video Calls',
    question: 'How do I minimize an active call to keep chatting?',
    steps: [
      'Click the Minimize arrow at the top left of the call window.',
      'The call collapses into a floating widget while you navigate other chats.',
    ],
  },

  // --- Category: Archiving & Pinning (41-50) ---
  {
    id: 41,
    category: 'Archiving & Pinning',
    question: 'How do I archive a chat thread using gestures?',
    steps: [
      'In the main chat list, swipe left on any chat row.',
      'The green Archive action reveals automatically; drag past 75px to archive.',
      'On desktop, click the chat item options or use multi-select mode to archive.',
    ],
  },
  {
    id: 42,
    category: 'Archiving & Pinning',
    question: 'Where do archived chats go and how do I open them?',
    steps: [
      'An "Archived Chats" bar appears at the very top of your chat list.',
      'Click or tap "Archived Chats" to open the archived folder view.',
      'All archived conversations are safely stored inside this folder.',
    ],
  },
  {
    id: 43,
    category: 'Archiving & Pinning',
    question: 'How do I unarchive a chat back to main chat list?',
    steps: [
      'Open the Archived Chats folder.',
      'Swipe left on the chat row to trigger Unarchive, or multi-select and click Unarchive.',
    ],
  },
  {
    id: 44,
    category: 'Archiving & Pinning',
    question: 'How do I hide the Archived Chats top bar from my chat list?',
    steps: [
      'Swipe left on the Archived Chats top bar row.',
      'Click the "Hide" button.',
      'The bar collapses and hides cleanly to keep your main chat view minimal.',
    ],
  },
  {
    id: 45,
    category: 'Archiving & Pinning',
    question: 'How do I reveal the hidden Archived Chats bar again?',
    steps: [
      'At the top of the main chat list, drag or pull down.',
      'Click "Pull down to reveal Archived Chats" banner.',
      'The Archived Chats folder bar instantly reappears at the top.',
    ],
  },
  {
    id: 46,
    category: 'Archiving & Pinning',
    question: 'How do I pin important chats to the top of my list?',
    steps: [
      'Long-press a chat row to enter Multi-Select Mode.',
      'Tap the Pin icon on the top action bar.',
      'Pinned chats stay fixed at the top of your chat list.',
    ],
  },
  {
    id: 47,
    category: 'Archiving & Pinning',
    question: 'How many chats can I pin at once?',
    steps: [
      'You can pin up to 10 chats in your main chat list.',
      'You can also pin up to 10 chats inside your Archived Chats folder separately!',
    ],
  },
  {
    id: 48,
    category: 'Archiving & Pinning',
    question: 'Do archived chats unarchive automatically when a new message arrives?',
    steps: [
      'By default, archived chats stay archived even when new messages arrive.',
      'To change this, go to Settings > Privacy & Security > Archiving Settings.',
      'Toggle "Keep Chats Archived" on or off.',
    ],
  },
  {
    id: 49,
    category: 'Archiving & Pinning',
    question: 'How do I bulk archive multiple chats at once?',
    steps: [
      'Long-press on any chat row to activate Multi-Select Mode.',
      'Tap additional chats to select them.',
      'Click the Archive icon on the top bulk action toolbar.',
    ],
  },
  {
    id: 50,
    category: 'Archiving & Pinning',
    question: 'How do I unarchive all chats in one click?',
    steps: [
      'Open the Archived Chats folder view.',
      'Click the 3-dot options menu at the top right header.',
      'Select "Unarchive All".',
    ],
  },

  // --- Category: Folders & Channels (51-60) ---
  {
    id: 51,
    category: 'Folders & Channels',
    question: 'How do I create custom chat folders (e.g., Work, Family)?',
    steps: [
      'Go to Settings > Chat Folders.',
      'Click "Create New Folder".',
      'Name your folder and select which chats, groups, or channels to include.',
    ],
  },
  {
    id: 52,
    category: 'Folders & Channels',
    question: 'How do I add selected chats to a folder using multi-select?',
    steps: [
      'Long-press chats in your main list to select them.',
      'Click the Folder Plus icon on the top action toolbar.',
      'Choose an existing folder or type a new folder name.',
    ],
  },
  {
    id: 53,
    category: 'Folders & Channels',
    question: 'How do I create a public or private Broadcast Channel?',
    steps: [
      'Go to Channels section from the main navigation rail.',
      'Click the Floating Action (+) button.',
      'Choose Channel name, avatar, description, and privacy type (Public or Private).',
    ],
  },
  {
    id: 54,
    category: 'Folders & Channels',
    question: 'How do I join a NEXA Community?',
    steps: [
      'Switch to the Communities tab on the navigation rail.',
      'Browse public communities or search by topic.',
      'Click "Join Community" to access all associated topic groups.',
    ],
  },
  {
    id: 55,
    category: 'Folders & Channels',
    question: 'How do group admin permissions work?',
    steps: [
      'Group creators can assign Admins with specific rights (Edit info, Delete messages, Ban users, Add members).',
      'Go to Group Info > Administrators > Add Admin.',
    ],
  },
  {
    id: 56,
    category: 'Folders & Channels',
    question: 'What is the maximum member limit for NEXA groups?',
    steps: [
      'Standard NEXA groups support up to 200,000 members.',
      'Channels have unlimited subscriber capacity.',
    ],
  },
  {
    id: 57,
    category: 'Folders & Channels',
    question: 'How do I share a group invitation link?',
    steps: [
      'Open Group Info header.',
      'Tap "Invite via Link".',
      'Copy the invite URL or generate a QR code for quick scanning.',
    ],
  },
  {
    id: 58,
    category: 'Folders & Channels',
    question: 'How do I mute group notification sounds?',
    steps: [
      'Open the group thread.',
      'Click the 3-dot options menu > Mute Notifications.',
      'Choose mute duration: 8 Hours, 1 Week, or Always.',
    ],
  },
  {
    id: 59,
    category: 'Folders & Channels',
    question: 'How do I pin an important announcement inside a group or channel?',
    steps: [
      'Long-press or right-click the message inside the group/channel.',
      'Select "Pin Message".',
      'Choose whether to notify all members about the pinned post.',
    ],
  },
  {
    id: 60,
    category: 'Folders & Channels',
    question: 'How do I delete or leave a channel?',
    steps: [
      'Open Channel Info.',
      'Click "Leave Channel" (for subscribers) or "Delete Channel" (for channel owner).',
    ],
  },

  // --- Category: Multi-Device & Web (61-70) ---
  {
    id: 61,
    category: 'Multi-Device & Web',
    question: 'How do I link NEXA Web on desktop computer?',
    steps: [
      'Open NEXA App on your phone > Settings > Devices & Sessions.',
      'Tap "Link New Device".',
      'Point your phone camera at the QR code shown on NEXA Web browser.',
    ],
  },
  {
    id: 62,
    category: 'Multi-Device & Web',
    question: 'Does NEXA Web work when my phone is turned off?',
    steps: [
      'Yes! NEXA uses independent multi-device sync.',
      'Once linked, NEXA Web functions standalone without requiring an active phone connection.',
    ],
  },
  {
    id: 63,
    category: 'Multi-Device & Web',
    question: 'How many devices can be connected simultaneously?',
    steps: [
      'You can connect up to 5 web browsers or desktop applications to one account simultaneously.',
    ],
  },
  {
    id: 64,
    category: 'Multi-Device & Web',
    question: 'How do I log out from a remote browser session?',
    steps: [
      'Go to Settings > Devices & Sessions on your phone.',
      'Locate the session in the list.',
      'Tap "Log Out" to immediately invalidate access on that remote computer.',
    ],
  },
  {
    id: 65,
    category: 'Multi-Device & Web',
    question: 'How do I enable desktop notifications on browser?',
    steps: [
      'When opening NEXA Web, click "Allow Notifications" on the browser banner.',
      'Or go to browser Site Settings > Notifications > Allow.',
    ],
  },
  {
    id: 66,
    category: 'Multi-Device & Web',
    question: 'How do I switch between Dark Theme and Light Theme?',
    steps: [
      'Go to Settings > Appearance & Theme.',
      'Select your preferred color theme: Light, Dark, Twilight, Emerald, or System Default.',
    ],
  },
  {
    id: 67,
    category: 'Multi-Device & Web',
    question: 'How do I adjust font size and chat bubble radius?',
    steps: [
      'Open Settings > Appearance & Theme.',
      'Use the Font Scale slider (90% to 125%) to change text size.',
      'Use the Corner Radius slider (4px to 12px) to customize message bubble curvature.',
    ],
  },
  {
    id: 68,
    category: 'Multi-Device & Web',
    question: 'How do I set a custom wallpaper background for chats?',
    steps: [
      'Go to Settings > Appearance > Chat Wallpaper.',
      'Choose from built-in gradients, solid colors, or upload your own image file.',
    ],
  },
  {
    id: 69,
    category: 'Multi-Device & Web',
    question: 'Is keyboard navigation supported on desktop NEXA Web?',
    steps: [
      'Yes! Use Tab / Shift+Tab to cycle through controls.',
      'Press Enter to send message, Shift+Enter for line break.',
      'Press Esc to close overlays or search modals.',
    ],
  },
  {
    id: 70,
    category: 'Multi-Device & Web',
    question: 'How do I drag & drop files directly into chats on desktop?',
    steps: [
      'Drag any photo, PDF, or file from your computer file explorer directly over the chat area.',
      'A dropzone overlay highlights automatically; drop file to send.',
    ],
  },

  // --- Category: Translation & Languages (71-80) ---
  {
    id: 71,
    category: 'Translation & Languages',
    question: 'How do I change the NEXA app interface language?',
    steps: [
      'Go to Settings > Language & Translation.',
      'Use the search bar to find your language (e.g., English, Swahili, Luganda, Spanish, French, German, Arabic, Hindi, Chinese, etc.).',
      'Select your language to instantly update the entire application UI.',
    ],
  },
  {
    id: 72,
    category: 'Translation & Languages',
    question: 'How does automatic message translation work?',
    steps: [
      'Go to Settings > Language & Translation.',
      'Toggle on "Auto-Translate Incoming Messages".',
      'All incoming messages received in foreign languages are automatically translated into your default language.',
    ],
  },
  {
    id: 73,
    category: 'Translation & Languages',
    question: 'How do I translate a single message manually?',
    steps: [
      'Click or long-press any message in a chat.',
      'Tap "Translate".',
      'The translated text appears directly below the original message bubble.',
    ],
  },
  {
    id: 74,
    category: 'Translation & Languages',
    question: 'Which languages are supported by NEXA Translation Engine?',
    steps: [
      'NEXA supports 28+ global and regional languages including Luganda, Swahili, Amharic, Yoruba, Zulu, Igbo, Spanish, French, German, Arabic, Hindi, Japanese, Chinese, and more.',
    ],
  },
  {
    id: 75,
    category: 'Translation & Languages',
    question: 'How do I switch back from translation to original text?',
    steps: [
      'Click "Show Original" beneath the translated message bubble to toggle back to the original text.',
    ],
  },
  {
    id: 76,
    category: 'Translation & Languages',
    question: 'Can I set a different target translation language from my app interface language?',
    steps: [
      'Yes! In Settings > Language & Translation, scroll to "Separate Message Translation Target Language".',
      'Select a different target language from the dropdown menu.',
    ],
  },
  {
    id: 77,
    category: 'Translation & Languages',
    question: 'Is voice message translation or transcription available?',
    steps: [
      'Voice messages include auto-transcription into text in supported regions.',
      'Tap the "Aa" icon beside any voice note player to reveal text transcript.',
    ],
  },
  {
    id: 78,
    category: 'Translation & Languages',
    question: 'Does translation consume additional cellular data?',
    steps: [
      'Translation requests are lightweight JSON text payloads, consuming minimal data bandwidth.',
    ],
  },
  {
    id: 79,
    category: 'Translation & Languages',
    question: 'How do I contribute language corrections or new local dialects?',
    steps: [
      'Contact our developer team via Help > Contact: The Great Minds (Developers).',
      'Submit feedback or pull requests for language dictionary improvements.',
    ],
  },
  {
    id: 80,
    category: 'Translation & Languages',
    question: 'Why didn’t a specific message auto-translate?',
    steps: [
      'Messages sent in your active target language or short single-word phrases (like "Ok") do not require translation and display natively.',
    ],
  },

  // --- Category: Data & Storage (81-90) ---
  {
    id: 81,
    category: 'Data & Storage',
    question: 'How do I manage media auto-download settings?',
    steps: [
      'Go to Settings > Data & Storage.',
      'Set auto-download preferences separately for Mobile Data, Wi-Fi, and Roaming.',
    ],
  },
  {
    id: 82,
    category: 'Data & Storage',
    question: 'How do I check how much storage NEXA is using?',
    steps: [
      'Open Settings > Data & Storage > Storage Usage.',
      'View total storage consumed broken down by photos, videos, files, and voice notes.',
    ],
  },
  {
    id: 83,
    category: 'Data & Storage',
    question: 'How do I export my chat history backup?',
    steps: [
      'Go to Settings > Data & Storage > Export Chat Backup.',
      'Choose export format: HTML (interactive document) or JSON (data structure).',
      'Click Export to download your offline archive.',
    ],
  },
  {
    id: 84,
    category: 'Data & Storage',
    question: 'How do I set network data usage limits for media uploads?',
    steps: [
      'In Settings > Data & Storage, choose Media Upload Quality (Standard, Compressed, or High Definition).',
    ],
  },
  {
    id: 85,
    category: 'Data & Storage',
    question: 'Are my chat backups stored in cloud or locally?',
    steps: [
      'NEXA supports cloud database sync as well as local client storage.',
    ],
  },
  {
    id: 86,
    category: 'Data & Storage',
    question: 'How do I clear specific large files or video caches?',
    steps: [
      'Navigate to Settings > Data & Storage > Storage Usage.',
      'Click on any chat to inspect and delete individual heavy media items.',
    ],
  },
  {
    id: 87,
    category: 'Data & Storage',
    question: 'How do I enable Low Data Mode for voice calls?',
    steps: [
      'Go to Settings > Data & Storage.',
      'Toggle on "Use Less Data for Calls".',
    ],
  },
  {
    id: 88,
    category: 'Data & Storage',
    question: 'Where are downloaded files saved on my computer/device?',
    steps: [
      'Files are saved directly to your device Downloads folder or NEXA Media directory.',
    ],
  },
  {
    id: 89,
    category: 'Data & Storage',
    question: 'Can I auto-delete old media after 30 days?',
    steps: [
      'Go to Settings > Data & Storage > Media Storage Auto-Clean.',
      'Select retention period: 3 Days, 1 Month, or Forever.',
    ],
  },
  {
    id: 90,
    category: 'Data & Storage',
    question: 'How do I reset storage settings to default?',
    steps: [
      'In Settings > Data & Storage, scroll to bottom and tap "Reset All Storage Preferences".',
    ],
  },

  // --- Category: Troubleshooting (91-100) ---
  {
    id: 91,
    category: 'Troubleshooting',
    question: 'Why am I not receiving notification alerts for new messages?',
    steps: [
      'Ensure Notifications are enabled in Settings > Notifications & Sounds.',
      'Check if device system Settings > App Notifications allows NEXA alerts.',
      'Verify the specific chat or group is not muted.',
    ],
  },
  {
    id: 92,
    category: 'Troubleshooting',
    question: 'What should I do if messages fail to send or show a clock icon?',
    steps: [
      'Check your Internet or Wi-Fi connection state.',
      'Try refreshing the app or toggling Airplane mode.',
      'Ensure proxy settings are configured properly if operating behind a firewall.',
    ],
  },
  {
    id: 93,
    category: 'Troubleshooting',
    question: 'Why is my avatar or profile photo not displaying?',
    steps: [
      'Go to Settings > Edit Profile and verify photo source.',
      'Ensure photo privacy settings allow contacts to view your avatar.',
    ],
  },
  {
    id: 94,
    category: 'Troubleshooting',
    question: 'How do I fix microphone permission errors on web browser?',
    steps: [
      'Click the padlock or site settings icon beside the browser address bar (URL).',
      'Change Microphone and Camera permissions to "Allow".',
      'Reload the page.',
    ],
  },
  {
    id: 95,
    category: 'Troubleshooting',
    question: 'What to do if the application feels slow or laggy?',
    steps: [
      'Go to Settings > Data & Storage and click "Clear Temporary Cache".',
      'Ensure you are using the latest version of your web browser or app runtime.',
    ],
  },
  {
    id: 96,
    category: 'Troubleshooting',
    question: 'How do I resolve date/time mismatch errors?',
    steps: [
      'Ensure your device system clock is set to "Automatic Time & Date".',
      'Mismatched timestamps prevent secure cryptographic handshake verification.',
    ],
  },
  {
    id: 97,
    category: 'Troubleshooting',
    question: 'Why can’t I find a contact in global search?',
    steps: [
      'Ensure you enter the exact username including @ handle or phone number.',
      'Check that the contact has not set their privacy to "Hidden from Search".',
    ],
  },
  {
    id: 98,
    category: 'Troubleshooting',
    question: 'What to do if QR code linking fails on desktop?',
    steps: [
      'Ensure high brightness on your phone screen when scanning.',
      'Click "Refresh QR Code" on desktop browser if expired.',
    ],
  },
  {
    id: 99,
    category: 'Troubleshooting',
    question: 'How do I report a software bug to the engineering team?',
    steps: [
      'Navigate to Help > Contact: The Great Minds (Developers).',
      'Choose "Email Developers" (hpro453176@gmail.com) or "NEXA App Direct Chat".',
      'Describe the issue, step-by-step reproduction, and error message observed.',
    ],
  },
  {
    id: 100,
    category: 'Troubleshooting',
    question: 'How do I get instant assistance with any app feature?',
    steps: [
      'Open Help > Option 2: ASK HAITHAM AI ASSISTANT.',
      'Ask Haitham AI any question about NEXA features, controls, settings, or shortcuts.',
      'Receive instant, detailed step-by-step guidance tailored to your exact prompt!',
    ],
  },
];

// Knowledge base engine for Haitham AI Assistant
export function getHaithamAIResponse(query: string): string {
  const q = query.toLowerCase().trim();

  if (!q) {
    return 'Hello! I am Haitham AI Assistant, your dedicated NEXA Messaging guide. Ask me anything about NEXA features, gestures, privacy, settings, or troubleshooting!';
  }

  if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
    return 'Greetings! I am Haitham AI Assistant. How can I help you master NEXA today? You can ask me about archiving, multi-select, peek gestures, languages, developer contacts, or security!';
  }

  if (q.includes('archive') || q.includes('archived')) {
    return '📂 **Archiving in NEXA**:\n• **Swipe Gesture**: In your chat list, swipe left on any chat row past 75px to archive it.\n• **Archived Bar**: An "Archived Chats" top bar appears at the top of your chat list.\n• **Hide Bar**: Swipe left on the Archived Bar and tap "Hide" to collapse it.\n• **Reveal Bar**: Drag/pull down at the top of your list to reveal the hidden Archived Chats bar anytime!';
  }

  if (q.includes('peek') || q.includes('preview')) {
    return '👁️ **Peek Message Preview**:\n• Long-press the avatar of any chat in your list.\n• A sleek preview window will pop up showing the recent messages without triggering read receipts (blue checks).\n• Release or click outside to close the preview window!';
  }

  if (q.includes('select') || q.includes('multi') || q.includes('bulk')) {
    return '☑️ **Multi-Select & Bulk Actions**:\n• Long-press any chat row to activate Multi-Select Mode.\n• Tap additional chats to select multiple items.\n• Use the top action bar to Bulk Pin, Bulk Mute, Bulk Archive, Mark as Read, Add to Folder, or Bulk Delete!';
  }

  if (q.includes('developer') || q.includes('contact') || q.includes('email') || q.includes('great minds') || q.includes('creator')) {
    return '👨‍💻 **Contacting The Great Minds (Developers)**:\n• **Email**: You can email the lead development team directly at **hpro453176@gmail.com**.\n• **NEXA App Chat**: Tap "Contact: The Great Minds (Developers)" right here in the Help drawer to open a direct chat thread with our core team!';
  }

  if (q.includes('language') || q.includes('translate') || q.includes('luganda') || q.includes('swahili') || q.includes('spanish')) {
    return '🌐 **Languages & Translation**:\n• Go to **Settings > Language & Translation**.\n• Search across 28+ languages (Luganda, Swahili, Spanish, French, German, Arabic, Hindi, Chinese, etc.).\n• Enable **Auto-Translate** for incoming messages to translate foreign texts seamlessly into your preferred language!';
  }

  if (q.includes('privacy') || q.includes('passcode') || q.includes('lock') || q.includes('block')) {
    return '🔒 **Privacy & Security**:\n• Go to **Settings > Privacy & Security**.\n• Enable **Passcode Lock** with a 4-digit or 6-digit PIN.\n• Set Profile Photo Visibility ("Everyone", "My Contacts", "Nobody").\n• Toggle Auto-Archive for unknown messages to prevent spam!';
  }

  if (q.includes('theme') || q.includes('dark') || q.includes('font') || q.includes('appearance')) {
    return '🎨 **Appearance & Customization**:\n• Go to **Settings > Appearance & Theme**.\n• Switch between Light, Dark, Twilight, Emerald, or System themes.\n• Custom-adjust Font Scale (90% to 125%) and Corner Radius (4px to 12px) for a crisp, professional UI!';
  }

  if (q.includes('status') || q.includes('story') || q.includes('stories')) {
    return '📸 **Status & Stories**:\n• Navigate to the Stories tab or top bar in Chats.\n• Tap "My Status" or the Camera icon to post updates (photos, video, or text).\n• Updates expire after 24 hours automatically.';
  }

  if (q.includes('call') || q.includes('video') || q.includes('voice')) {
    return '📞 **Voice & Video Calls**:\n• Click the Phone or Video icon in any 1-on-1 chat header.\n• NEXA Web supports high-definition WebRTC browser calls with low-data optimization modes!';
  }

  // Fallback match against FAQ database
  const match = ALL_FAQS.find(
    (f) =>
      f.question.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      f.steps.some((s) => s.toLowerCase().includes(q))
  );

  if (match) {
    return `💡 **${match.question}** (${match.category})\n\n` + match.steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
  }

  return `🤖 I studied NEXA from corner to corner! You asked: "${query}".\n\nHere is how to do this in NEXA:\n1. Open Settings or navigate to the corresponding tab in the left rail.\n2. Use the search bar or gesture shortcuts (such as swipe left to archive or long-press to multi-select).\n3. If you need direct engineering help, visit Option 3 in this Help menu to contact **The Great Minds (Developers)** via email (**hpro453176@gmail.com**) or direct NEXA Chat!`;
}
