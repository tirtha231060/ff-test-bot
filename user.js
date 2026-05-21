const tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

// আপনার ক্লাউডফ্লেয়ার ওয়ার্কারের আসল URL এখানে বসাবেন
const WORKER_URL = "https://divine-lab-ced7.tirtharoyvuson.workers.dev/"; 

let appState = {
    currentUser: null,
    userId: null,
    matches: [],
    esportsData: {
        matches: [],
        registrations: {}, 
        counts: {}, 
        points: [],
        history: []
    },
    myMatches: [],
    results: [],
    tasks: [], 
    rulesData: [],
    transactions: [],
    supportData: [],
    adminConfig: {
        rules: ""
    },
    currentSection: 'play',
    currentCategory: 'all',
    darkMode: false,
    walletBalance: 0
};

// --- সিকিউর টেলিগ্রাম অটো লগইন ফাংশন ---
async function initSecureTelegramAuth() {
    if (!tg.initData) {
        alert("Please open this app inside Telegram!");
        return;
    }
    try {
        const response = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ initData: tg.initData, action: "login" })
        });
        const data = await response.json();
        if (response.ok && data.token) {
            // ফায়ারবেসে টোকেন দিয়ে সিকিউর লগইন
            const userCredential = await firebase.auth().signInWithCustomToken(data.token);
            appState.userId = userCredential.user.uid;
            console.log("Secure Login Success! UID:", appState.userId);
        } else {
            alert("Verification Failed: " + (data.error || "Unknown Error"));
        }
    } catch (error) {
        console.error("Auth Error:", error);
    }
}

// অ্যাপ লোড হওয়ার সাথে সাথে লগইন রান হবে
document.addEventListener("DOMContentLoaded", () => {
    initSecureTelegramAuth();
});

let currentHistoryTab = 'deposit'; 
let currentEsportsHistoryTab = 'all';


        // DOM Elements
        const themeToggle = document.getElementById('themeToggle');
        const noticeBanner = document.getElementById('noticeBanner');
        const noticeText = document.getElementById('noticeText');
        const footerBtns = document.querySelectorAll('.footer-btn');
        const sections = document.querySelectorAll('.section');
        const categories = document.querySelectorAll('.category');
        const matchesContainer = document.getElementById('matchesContainer');
        const noMatches = document.getElementById('noMatches');
        const joinModal = document.getElementById('joinModal');
        const closeJoinModal = document.getElementById('closeJoinModal');
        const joinForm = document.getElementById('joinForm');
        const joinTypeSelect = document.getElementById('joinType');
        const playerNamesContainer = document.getElementById('playerNamesContainer');
        const joinRulesText = document.getElementById('joinRulesText');
        
        // Participants Modal Elements
        const participantsModal = document.getElementById('participantsModal');
        const closeParticipantsModal = document.getElementById('closeParticipantsModal');
        const participantsListContent = document.getElementById('participantsListContent');

        // Prize Pool Modal Elements
        const prizePoolModal = document.getElementById('prizePoolModal');
        const closePrizePoolModal = document.getElementById('closePrizePoolModal');
        const prizePoolContent = document.getElementById('prizePoolContent');

        const roomInfoModal = document.getElementById('roomInfoModal');
        const closeRoomModal = document.getElementById('closeRoomModal');
        
        // Profile Elements
        const profileName = document.getElementById('profileName');
        const profileUsername = document.getElementById('profileUsername');
        const walletBalance = document.getElementById('walletBalance');
        const depositBtn = document.getElementById('depositBtn');
        const withdrawBtn = document.getElementById('withdrawBtn');
        
        // Profile New Feature Elements
        const redeemBtn = document.getElementById('redeemBtn');
        const referBtn = document.getElementById('referBtn');
        const rulesBtn = document.getElementById('rulesBtn');
        const supportBtn = document.getElementById('supportBtn');
        const tasksBtn = document.getElementById('tasksBtn');
        const historyBtn = document.getElementById('historyBtn');

        const redeemModal = document.getElementById('redeemModal');
        const closeRedeemModal = document.getElementById('closeRedeemModal');
        const applyRedeemBtn = document.getElementById('applyRedeemBtn');
        
        const referModal = document.getElementById('referModal');
        const closeReferModal = document.getElementById('closeReferModal');
        const referLinkText = document.getElementById('referLinkText');
        const copyReferBtn = document.getElementById('copyReferBtn');

        const infoModal = document.getElementById('infoModal');
        const closeInfoModal = document.getElementById('closeInfoModal');
        const infoModalTitle = document.getElementById('infoModalTitle');
        const infoModalContent = document.getElementById('infoModalContent');

        

        
        const historyListContent = document.getElementById('historyListContent');
        
        // Esports Elements
        const esportsTabs = document.querySelectorAll('.esports-tab');
        const esportsContents = document.querySelectorAll('.esports-content');
        const esportsMatchesView = document.getElementById('esportsMatchesView');
        const esportsPointsView = document.getElementById('esportsPointsView');
        const esportsHistoryView = document.getElementById('esportsHistoryView');
        
        // New Esports Modal Elements
        const esportsJoinModal = document.getElementById('esportsJoinModal');
        const closeEsportsJoinModal = document.getElementById('closeEsportsJoinModal');
        const esportsJoinForm = document.getElementById('esportsJoinForm');
        
        // Specific Points Modal
        const esportsMatchPointsModal = document.getElementById('esportsMatchPointsModal');
        const closeEsportsMatchPointsModal = document.getElementById('closeEsportsMatchPointsModal');

        // আপনার Cloudflare Worker URL
const CLOUDFLARE_WORKER_URL = "https://divine-lab-ced7.tirtharoyvuson.workers.dev/";

document.addEventListener('DOMContentLoaded', function() {
    // অ্যাপ লোড হলে প্রথমেই ডাটাবেস কল না করে, সিকিউর লগইন প্রসেস শুরু করবে
    secureFirebaseLogin();
});

async function secureFirebaseLogin() {
    try {
        const initData = tg.initData;
        
        // যদি কেউ টেলিগ্রাম ছাড়া সরাসরি ব্রাউজার থেকে ওপেন করে
        if (!initData) {
            console.warn("Telegram environment not found. Running in demo/testing mode.");
            startLoadingDatabaseData();
            return;
        }

        // ১. ক্লাউডফ্লেয়ার ওয়ার্কার থেকে কাস্টম টোকেন আনা
        const response = await fetch(CLOUDFLARE_WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initData: initData })
        });

        if (!response.ok) {
            throw new Error('Telegram Data Verification Failed!');
        }

        const data = await response.json();
        
        // ২. ফায়ারবেসে কাস্টম টোকেন দিয়ে লগইন করা
        const userCredential = await firebase.auth().signInWithCustomToken(data.token);
        console.log("Firebase Secure Login Successful! UID:", userCredential.user.uid);

        // ৩. লগইন সফল হলে মূল ডাটাবেসের কাজ শুরু হবে
        startLoadingDatabaseData();

    } catch (error) {
        console.error("Security Check Error:", error.message);
        alert("Authentication failed! Please make sure you are opening the app from Telegram.");
    }
}

// এই ফাংশনটি তখনই কল হবে, যখন ইউজার ১০০% ভেরিফায়েড
function startLoadingDatabaseData() {
    initApp();
    setupEventListeners();
    loadNotice();
    loadMatches();
    loadUserProfile();
    loadWallet();
    startLuckyDrawTimers();
}

        
        function checkMaintenanceMode() {
    database.ref('settings/maintenanceMode').on('value', (snapshot) => {
        const isMaintenanceOn = snapshot.val() === true;
        const maintenanceModal = document.getElementById('maintenanceModal');
        const banModal = document.getElementById('banModal');
        
        if (isMaintenanceOn) {
            // Maintenance Mode On থাকলে মডাল দেখাবে এবং স্ক্রল বন্ধ করবে
            maintenanceModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            // Maintenance Mode Off থাকলে মডাল সরিয়ে নিবে
            maintenanceModal.classList.remove('active');
            // যদি ইউজার ব্যান না হয়ে থাকে, তাহলেই কেবল স্ক্রল চালু করবে
            if (!banModal.classList.contains('active')) {
                document.body.style.overflow = 'auto';
            }
        }
    });
}

      // user.html - এর স্ক্রিপ্টের ভিতরে checkBanStatus ফাংশনটি রিপ্লেস করুন

function checkBanStatus() {
    if (!appState.userId) return;

    // পুরো ইউজার নোডটি চেক করা হচ্ছে (isBanned এবং banReason পাওয়ার জন্য)
    database.ref('users/' + appState.userId).on('value', (snapshot) => {
        const user = snapshot.val() || {};
        
        if (user.isBanned === true) {
            // মডাল দেখানো
            document.getElementById('banModal').classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // কারণ সেট করা (যদি অ্যাডমিন কিছু না লেখে তবে ডিফল্ট মেসেজ দেখাবে)
            const reason = user.banReason || "Violation of Terms & Conditions";
            document.getElementById('banReasonDisplay').innerText = reason;
        } else {
            // আনব্যান থাকলে মডাল সরানো
            document.getElementById('banModal').classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}


        function initApp() {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                enableDarkMode();
            }
            
            // user.html এর initApp ফাংশনের ভিতরে এই অংশটি আপডেট করুন
if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
    const tgUser = tg.initDataUnsafe.user;
    
    // কনসোলে চেক করুন ছবি আসছে কিনা (Debugging)
    console.log("Telegram User Data:", tgUser);

    appState.userId = tgUser.id;
    checkBanStatus();
    checkMaintenanceMode();
    appState.currentUser = {
        id: tgUser.id,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name || '',
        username: tgUser.username || `user_${tgUser.id}`,
        languageCode: tgUser.language_code || 'en',
        // photo_url ছোট হাতের অক্ষরে থাকে
        photoUrl: tgUser.photo_url || null 
    };
    
       // --- ADD THIS DEVICE IDENTITY CODE ---
        const deviceInfo = getDeviceInfo();
    database.ref('users/' + appState.userId).update({
        deviceName: deviceInfo.deviceName,
        deviceId: deviceInfo.deviceId,
        photoUrl: appState.currentUser.photoUrl || null // <-- এই লাইনটি যোগ করা হলো
    });

    
    updateProfileDisplay();
    fetchUserJoinedMatches();
    
    // --- REFERRAL & NEW USER CREATION LOGIC (Dynamic Bonus) ---
const userRef = database.ref('users/' + appState.userId);
userRef.once('value').then(snapshot => {
    if (!snapshot.exists()) {
        // ১. ইউজার ডাটাবেসে নেই, মানে সে নতুন। তার ডিফল্ট প্রোফাইল তৈরি করুন।
                let updates = {};
        // শুধুমাত্র নতুন ইউজার হলেই এই ডাটাগুলো একবারই সেভ হবে, তাই কোড আপডেট হলেও জয়েন ডেট পরিবর্তন হবে না।
        updates[`users/${appState.userId}`] = {
            firstName: appState.currentUser.firstName || '',
            username: appState.currentUser.username || '',
            balance: 0,
            winningBalance: 0,
            joinDate: firebase.database.ServerValue.TIMESTAMP // Advanced Server Time (Hack-proof)
        };


        // ২. চেক করুন সে কারো রেফার লিংকের মাধ্যমে এসেছে কিনা
        const startParam = tg.initDataUnsafe ? tg.initDataUnsafe.start_param : null; 
        
        if (startParam && startParam != appState.userId) {
            const referrerId = startParam;

            // ৩. ডাটাবেস থেকে অ্যাডমিনের সেট করা বোনাস এমাউন্ট নিয়ে আসুন
            database.ref('settings/referralBonus').once('value').then(settingSnap => {
                const REWARD_AMOUNT = parseFloat(settingSnap.val()) || 10; // যদি সেট করা না থাকে, তবে ডিফল্ট ১০

                              if (REWARD_AMOUNT > 0) {
                    // রেফারারের প্রোফাইলে ব্যালেন্স অ্যাড করা
                    database.ref('users/' + referrerId).once('value').then(refSnap => {
                        if (refSnap.exists()) {
                            const currentBal = parseFloat(refSnap.val().balance) || 0;
                            const currentReferrals = parseInt(refSnap.val().referrals) || 0; 
                            const currentEarnings = parseFloat(refSnap.val().referralEarnings) || 0;

                            updates[`users/${referrerId}/balance`] = currentBal + REWARD_AMOUNT;
                            updates[`users/${referrerId}/referrals`] = currentReferrals + 1;
                            updates[`users/${referrerId}/referralEarnings`] = currentEarnings + REWARD_AMOUNT;

                            // --- অ্যাডভান্সড: রেফার হওয়া ইউজারের তথ্য সেভ করা ---
                            const refUserKey = database.ref(`users/${referrerId}/referredUsers`).push().key;
                            let newUserName = appState.currentUser.firstName || "User";
                            if(appState.currentUser.lastName) {
                                newUserName += " " + appState.currentUser.lastName;
                            }
                            updates[`users/${referrerId}/referredUsers/${refUserKey}`] = {
                                name: newUserName,
                                date: Date.now(),
                                bonus: REWARD_AMOUNT
                            };

                            // রেফারারের হিস্ট্রিতে ট্রানজেকশন সেভ করা
                            const newTxnKey = database.ref('transactions').push().key;
                            updates[`transactions/${newTxnKey}`] = {
                                userId: referrerId,
                                type: 'deposit',
                                amount: REWARD_AMOUNT,
                                date: Date.now(),
                                status: 'success',
                                method: 'Referral Bonus',
                                title: `Referral Reward (New User Joined)`
                            };
                            
                            // ডাটাবেস আপডেট
                            database.ref().update(updates);
                        } else {
                            database.ref().update(updates);
                        }
                    });
                }
  else {
                    // বোনাস 0 হলে শুধু ইউজার তৈরি হবে
                    database.ref().update(updates);
                }
            });
        } else {
            // রেফার ছাড়া আসলে শুধু প্রোফাইল তৈরি হবে
            database.ref().update(updates);
        }
    }
});
// ------------------------------------------

}

            
             else {
                appState.userId = 'demo_user_123';
                appState.currentUser = {
                    id: 'demo_user_123',
                    firstName: 'Demo',
                    lastName: 'User',
                    username: 'demo_user',
                    languageCode: 'en'
                };
                updateProfileDisplay();
                fetchUserJoinedMatches();
            }

            fetchAdminData();
            fetchTransactions();
            fetchSupportData();
        }
        
        function fetchAdminData() {
    // Demo Tasks Removed. Now fetching real tasks.
    database.ref('tasks').on('value', (snapshot) => {
        const data = snapshot.val();
        appState.tasks = [];
        if (data) {
            Object.keys(data).forEach(key => {
                appState.tasks.push({
                    id: key,
                    ...data[key]
                });
            });
        }
            
    });

    // Rules Fetching (New Logic)
    database.ref('rules').on('value', (snapshot) => {
        const data = snapshot.val();
        appState.rulesData = []; // State এ নতুন ভ্যারিয়েবল
        if (data) {
            Object.keys(data).forEach(key => {
                appState.rulesData.push(data[key]);
            });
        }
    });
}

      
        function fetchSupportData() {
    database.ref('support').on('value', (snapshot) => {
        const data = snapshot.val() || {};
        
        // ১. আপনার অ্যাপের আগের স্টেট আপডেট রাখা (যাতে কোনো এরর না আসে)
        appState.supportData = [];
        if (data) {
            Object.keys(data).forEach(key => {
                appState.supportData.push(data[key]);
            });
        }

        // ২. আমাদের নতুন কার্ড ডিজাইনের রেন্ডার লজিক
        const grid = document.getElementById('userSupportGrid');
        if(!grid) return;
        grid.innerHTML = '';
        
        if(Object.keys(data).length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align:center; padding: 40px; color:var(--text-muted); background:var(--bg-card); border-radius:16px; border:1px dashed var(--border);">
                    <i class="fas fa-comment-slash" style="font-size:40px; margin-bottom:10px; opacity:0.3;"></i><br>
                    No support channels available right now.
                </div>`;
            return;
        }

        Object.keys(data).forEach(k => {
            const item = data[k];
            const isOnline = item.status === 'online';

            // Image Handling
            let finalImg = 'https://placehold.co/100x100/1e293b/FFF?text=IMG';
            if (item.image && item.image.includes('src="')) {
                const match = item.image.match(/src="([^"]+)"/);
                if (match) finalImg = match[1];
            } else if (item.image && item.image.trim() !== '') {
                finalImg = item.image;
            }

            // Button Logic
            let btn = isOnline
                ? `<a href="${item.link}" target="_blank" class="sup-btn active" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none;">
                     <i class="fas fa-paper-plane"></i> Message Now
                   </a>`
                : `<div class="sup-btn" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); cursor: not-allowed;">
                     <i class="fas fa-moon"></i> Currently Offline
                   </div>`;

            // Status Badge Logic
            let statusBadge = isOnline 
                ? `<span style="background: rgba(16, 185, 129, 0.15); color: #10b981; font-size: 10px; padding: 3px 8px; border-radius: 12px; font-weight: 800; letter-spacing: 0.5px; display: flex; align-items: center; gap: 4px;">
                     <span style="width: 6px; height: 6px; background: #10b981; border-radius: 50%; display: inline-block; animation: pulse 2s infinite;"></span> ONLINE
                   </span>`
                : `<span style="background: rgba(239, 68, 68, 0.15); color: #ef4444; font-size: 10px; padding: 3px 8px; border-radius: 12px; font-weight: 800; letter-spacing: 0.5px; display: flex; align-items: center; gap: 4px;">
                     <span style="width: 6px; height: 6px; background: #ef4444; border-radius: 50%; display: inline-block;"></span> OFFLINE
                   </span>`;

            grid.innerHTML += `
            <div class="sup-card ${isOnline ? '' : 'offline'}">
                <div class="sup-header">
                    <img src="${finalImg}" class="sup-icon" onerror="this.onerror=null; this.src='https://placehold.co/100x100/1e293b/FFF?text=Icon';">
                    <div class="sup-info">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 5px;">
                            <div class="sup-title">${item.name}</div>
                            ${statusBadge}
                        </div>
                        <div class="sup-msg">${item.message || 'Always here to help you.'}</div>
                    </div>
                </div>
                <div style="margin-top: auto;">
                    ${btn}
                </div>
            </div>`;
        });
    });
}


        function fetchTransactions() {
            appState.transactions = [];
        }

        function setupEventListeners() {
        
            // setupEventListeners() এর ভেতরে depositBtn এর জন্য এই কোডটি দিন
depositBtn.addEventListener('click', () => {
    switchSection('deposit'); // এটি নতুন পেজে নিয়ে যাবে
    loadDepositMethodsPage(); // মেথডগুলো লোড করবে
});

// setupEventListeners() এর ভিতরে:

withdrawBtn.addEventListener('click', () => {
    switchSection('withdraw'); // নতুন সেকশনে নিয়ে যাবে
    loadWithdrawMethodsPage(); // মেথড লোড করবে
});


// Copy Button Logic (New Page)
document.getElementById('copyNumberBtn').addEventListener('click', () => {
    const num = document.getElementById('targetNumber').textContent;
    copyToClipboard(num);
    const btn = document.getElementById('copyNumberBtn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => btn.innerHTML = originalHTML, 2000);
});

// Form Submit Logic (New Page)
document.getElementById('depositFormPage').addEventListener('submit', function(e) {
    e.preventDefault();
    submitDepositPage();
});

            
            themeToggle.addEventListener('click', toggleTheme);
            
            footerBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const tabId = this.getAttribute('data-tab');
                    switchSection(tabId);
                });
            });
            
            categories.forEach(category => {
                category.addEventListener('click', function() {
                    const categoryId = this.getAttribute('data-category');
                    switchCategory(categoryId);
                });
            });
            
            esportsTabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    const tabId = this.getAttribute('data-es-tab');
                    esportsTabs.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    esportsContents.forEach(c => c.classList.remove('active'));
                    if(tabId === 'matches') esportsMatchesView.classList.add('active');
                    if(tabId === 'points') esportsPointsView.classList.add('active');
                    if(tabId === 'history') esportsHistoryView.classList.add('active');
                    
                    if(tabId === 'points') renderEsports(); // Re-render to show points cards
                });
            });

            closeJoinModal.addEventListener('click', () => joinModal.classList.remove('active'));
            closeParticipantsModal.addEventListener('click', () => participantsModal.classList.remove('active'));
            closePrizePoolModal.addEventListener('click', () => prizePoolModal.classList.remove('active'));
            closeRoomModal.addEventListener('click', () => roomInfoModal.classList.remove('active'));
            
            closeRedeemModal.addEventListener('click', () => redeemModal.classList.remove('active'));
            closeReferModal.addEventListener('click', () => referModal.classList.remove('active'));
            closeInfoModal.addEventListener('click', () => infoModal.classList.remove('active'));
            
            
            closeEsportsJoinModal.addEventListener('click', () => esportsJoinModal.classList.remove('active'));
            // Close Specific Points Modal
            closeEsportsMatchPointsModal.addEventListener('click', () => esportsMatchPointsModal.classList.remove('active'));

            
            
            
            const closeMatchScoreboardModal = document.getElementById('closeMatchScoreboardModal');
if(closeMatchScoreboardModal) {
    closeMatchScoreboardModal.addEventListener('click', () => {
        document.getElementById('matchScoreboardModal').classList.remove('active');
    });
}

            
            esportsJoinForm.addEventListener('submit', function(e) {
                e.preventDefault();
                submitEsportsRegistration();
            });

            redeemBtn.addEventListener('click', () => redeemModal.classList.add('active'));
            
                        // --- ADVANCED REFERRAL LOGIC ---
            referBtn.addEventListener('click', () => {
                // আপনার বটের ইউজারনেম এবং মিনি অ্যাপের শর্টনেম দিন
                const botUsername = "de1stmo_bot"; 
                const appShortName = "app"; 
                const link = `https://t.me/${botUsername}/${appShortName}?startapp=${appState.userId}`;
                
                document.getElementById('referLinkText').textContent = link;
                document.getElementById('copyReferBtnAdvanced').setAttribute('data-text', link);
                
                // ইউজারের ডাটাবেস থেকে রিয়েল-টাইম ডাটা লোড করা
                database.ref('users/' + appState.userId).once('value').then(snap => {
                    const user = snap.val() || {};
                    const totalRefs = parseInt(user.referrals) || 0;
                    const totalEarned = parseFloat(user.referralEarnings) || 0;
                    
                    document.getElementById('advRefTotal').textContent = totalRefs;
                    document.getElementById('advRefEarned').textContent = totalEarned.toFixed(2);
                    
                    // মাইলস্টোন ক্যালকুলেশন
                    let nextTarget = 5;
                    if(totalRefs >= 5) nextTarget = 10;
                    if(totalRefs >= 10) nextTarget = 20;
                    if(totalRefs >= 20) nextTarget = 50;
                    if(totalRefs >= 50) nextTarget = 100;
                    if(totalRefs >= 100) nextTarget = totalRefs + 50;
                    
                    const progressPct = Math.min((totalRefs / nextTarget) * 100, 100);
                    document.getElementById('refMilestoneText').textContent = `${totalRefs} / ${nextTarget}`;
                    document.getElementById('refProgressBar').style.width = `${progressPct}%`;
                    
                    // রিফারেল হিস্ট্রি লোড
                    const historyContainer = document.getElementById('recentReferralsList');
                    const referredUsers = user.referredUsers || {};
                    
                    if (Object.keys(referredUsers).length === 0) {
                        historyContainer.innerHTML = `
                            <div style="text-align: center; padding: 20px; color: var(--gray); font-size: 13px;">
                                <i class="fas fa-users-slash" style="font-size: 24px; margin-bottom: 10px; opacity: 0.5;"></i><br>
                                You haven't referred anyone yet.
                            </div>
                        `;
                    } else {
                        historyContainer.innerHTML = '';
                        // নতুন জয়েন করা ইউজার আগে দেখানোর জন্য সর্টিং
                        const usersArray = Object.values(referredUsers).sort((a,b) => b.date - a.date);
                        
                        usersArray.forEach(u => {
                            const d = new Date(u.date);
                            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            
                            // প্রাইভেসি: ইউজারের নামের কিছু অংশ হাইড করা (যেমন: Rakib -> Ra***)
                            let safeName = u.name;
                            if(safeName.length > 2) {
                                safeName = safeName.substring(0, 2) + "***";
                            }
                            const initial = safeName.charAt(0).toUpperCase();

                            historyContainer.innerHTML += `
                                <div class="ref-history-item">
                                    <div style="display:flex; align-items:center;">
                                        <div class="ref-avatar">${initial}</div>
                                        <div>
                                            <div style="font-size: 14px; font-weight: 700; color: var(--text-light);">${safeName} Joined</div>
                                            <div style="font-size: 11px; color: var(--gray);"><i class="far fa-clock"></i> ${dateStr}</div>
                                        </div>
                                    </div>
                                    <div style="font-weight: 800; color: var(--success); font-size: 14px;">+৳${u.bonus}</div>
                                </div>
                            `;
                        });
                        
                        // ডার্ক মোডের জন্য টেক্সট কালার ফিক্স
                        if(document.body.classList.contains('dark-mode')) {
                            historyContainer.querySelectorAll('[style*="color: var(--text-light)"]').forEach(el => el.style.color = 'var(--text-dark)');
                        }
                    }
                });

                referModal.classList.add('active');
            });

            // অ্যাডভান্সড কপি বাটন
            document.getElementById('copyReferBtnAdvanced').addEventListener('click', function(e) {
                e.preventDefault();
                const link = this.getAttribute('data-text');
                copyToClipboard(link);
                
                const originalHTML = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => this.innerHTML = originalHTML, 2000);
            });

            // ন্যাটিভ শেয়ার বাটন (মোবাইল অ্যাপের জন্য)
            document.getElementById('shareReferBtnAdvanced').addEventListener('click', function() {
                const link = document.getElementById('copyReferBtnAdvanced').getAttribute('data-text');
                const shareText = "Hey! Join Battle Royale Tournament using my link and let's play together!";
                
                if (navigator.share) {
                    navigator.share({
                        title: 'Battle Royale Tournament',
                        text: shareText,
                        url: link,
                    }).catch(err => console.log("Share failed:", err));
                } else {
                    // Fallback for Web/Desktop (Telegram Share)
                    window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(shareText)}`, '_blank');
                }
            });

if (copyReferBtn) {
    copyReferBtn.addEventListener('click', function(e) {
        // এটি গ্লোবাল লিসেনারকে ব্লক করে ডাইরেক্ট কপি হতে সাহায্য করবে
        e.preventDefault();
        e.stopPropagation(); 
        
        const textToCopy = referLinkText.textContent;
        const btn = this;
        
        // সাকসেস এনিমেশন এবং ভাইব্রেশন
        const showSuccess = () => {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i>';
            btn.style.color = 'var(--success)';
            
            if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            }
            
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.color = '';
            }, 2000);
        };

        // iOS/Android Fallback Copy (সবচেয়ে কার্যকরী পদ্ধতি)
        const fallbackCopy = () => {
            const tempInput = document.createElement("input");
            tempInput.value = textToCopy;
            document.body.appendChild(tempInput);
            
            // iOS এর জন্য স্পেশাল সিলেকশন
            tempInput.focus();
            tempInput.select();
            tempInput.setSelectionRange(0, 99999); 
            
            try {
                document.execCommand("copy");
                showSuccess();
            } catch (err) {
                alert("Copy failed! Please select the text manually.");
            }
            
            document.body.removeChild(tempInput);
        };

        // মডার্ন ব্রাউজার API
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(textToCopy)
                .then(() => showSuccess())
                .catch(() => fallbackCopy()); // ফেইল করলে ফলব্যাক কাজ করবে
        } else {
            fallbackCopy();
        }
    });
}


// Elements
const rulesTabsHeader = document.getElementById('rulesTabsHeader');
const rulesContentBody = document.getElementById('rulesContentBody');

// --- Rules Button Logic (Modern Profile Style) ---
rulesBtn.addEventListener('click', () => {
    // ১. স্টাইল ইনজেকশন (মডার্ন প্রোফাইল ডিজাইনের মতো)
    if (!document.getElementById('rules-pro-layout-style')) {
        const style = document.createElement('style');
        style.id = 'rules-pro-layout-style';
        style.innerHTML = `
            .rules-pro-page {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background-color: var(--light-bg); z-index: 99999;
                display: flex; flex-direction: column;
                transform: translateX(100%); transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }
            body.dark-mode .rules-pro-page { background-color: var(--dark-bg); }
            .rules-pro-page.active { transform: translateX(0); }
            
            /* Profile-style Gradient Header */
            .rp-header-pro {
                background: linear-gradient(135deg, var(--primary), #6366f1);
                padding: 30px 20px 60px 20px;
                border-radius: 0 0 30px 30px;
                color: white;
                box-shadow: 0 10px 20px rgba(59, 130, 246, 0.15);
                display: flex; align-items: center; gap: 15px;
            }
            .rp-header-pro h2 { font-size: 22px; font-weight: 800; margin: 0; letter-spacing: 0.5px; }
            .rp-back-btn { 
                background: rgba(255,255,255,0.2); border: none; width: 42px; height: 42px; 
                border-radius: 12px; color: white; font-size: 18px; display: flex; 
                align-items: center; justify-content: center; cursor: pointer; 
                backdrop-filter: blur(5px); transition: 0.2s;
            }
            .rp-back-btn:active { transform: scale(0.95); }
            
            /* Overlapping Tab Card (Like Wallet Card) */
            .rp-tabs-container {
                background: var(--card-light); border-radius: 20px; padding: 12px;
                margin: -35px 15px 15px 15px; position: relative; z-index: 10;
                box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;
                display: flex; gap: 10px; overflow-x: auto; scrollbar-width: none;
            }
            body.dark-mode .rp-tabs-container { 
                background: var(--card-dark); border-color: #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.3); 
            }
            .rp-tabs-container::-webkit-scrollbar { display: none; }
            
            /* Tab Buttons */
            .rp-tab-btn {
                flex: 0 0 auto; padding: 10px 20px; border-radius: 14px; font-size: 13px; font-weight: 800;
                cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                background: rgba(148, 163, 184, 0.1); color: var(--gray); border: 1px solid transparent;
            }
            body.dark-mode .rp-tab-btn { background: rgba(255,255,255,0.05); }
            .rp-tab-btn.active {
                background: linear-gradient(135deg, var(--primary), #2563eb); color: white;
                box-shadow: 0 6px 15px rgba(59, 130, 246, 0.3); transform: translateY(-2px);
                border-color: rgba(255,255,255,0.1);
            }
            
            /* Content Area */
            .rp-content-wrapper {
                flex: 1; overflow-y: auto; padding: 0 15px 25px 15px;
            }
            .rp-content-card {
                background: var(--card-light); border-radius: 20px; padding: 25px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #e5e7eb;
                font-size: 14px; line-height: 1.7; color: var(--text-light); min-height: 200px;
            }
            body.dark-mode .rp-content-card { 
                background: var(--card-dark); border-color: #334155; color: var(--text-dark); 
            }
            
            /* Rule List Style inside Content */
            .rule-bullet {
                display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px;
            }
            .rule-bullet i {
                color: var(--primary); font-size: 14px; margin-top: 4px;
            }
        `;
        document.head.appendChild(style);

        // HTML তৈরি
        const pageDiv = document.createElement('div');
        pageDiv.id = 'rulesProPage';
        pageDiv.className = 'rules-pro-page';
        pageDiv.innerHTML = `
            <div class="rp-header-pro">
                <button class="rp-back-btn" id="closeRulesProPage"><i class="fas fa-arrow-left"></i></button>
                <h2><i class="fas fa-book-open" style="margin-right: 8px; opacity: 0.9;"></i> Rules & Terms</h2>
            </div>
            <div class="rp-tabs-container" id="rulesProTabs"></div>
            <div class="rp-content-wrapper">
                <div class="rp-content-card" id="rulesProContent"></div>
            </div>
        `;
        document.body.appendChild(pageDiv);

        document.getElementById('closeRulesProPage').addEventListener('click', () => {
            document.getElementById('rulesProPage').classList.remove('active');
        });
    }

    const page = document.getElementById('rulesProPage');
    const tabsContainer = document.getElementById('rulesProTabs');
    const contentContainer = document.getElementById('rulesProContent');

    page.classList.add('active');
    tabsContainer.innerHTML = '';

    // ডাটা লোড
    if (!appState.rulesData || appState.rulesData.length === 0) {
        contentContainer.innerHTML = `
            <div style="text-align:center; padding: 50px 10px; color: var(--gray);">
                <i class="fas fa-clipboard-list" style="font-size: 45px; margin-bottom: 15px; opacity: 0.5;"></i>
                <p style="font-weight: 700; font-size: 16px;">No rules found.</p>
                <p style="font-size: 13px; margin-top: 5px;">Admin hasn't configured any rules yet.</p>
            </div>`;
    } else {
        let isFirst = true;
        appState.rulesData.forEach((rule) => {
            const btn = document.createElement('div');
            btn.className = 'rp-tab-btn';
            btn.innerHTML = `<i class="fas fa-hashtag" style="opacity:0.5; margin-right:4px;"></i> ${rule.title}`;
            
            btn.onclick = () => {
                // ১. সব বাটন থেকে Active ক্লাস রিমুভ
                Array.from(tabsContainer.children).forEach(child => child.classList.remove('active'));

                // ২. ক্লিক করা বাটনে Active ক্লাস অ্যাড
                btn.classList.add('active');

                // ৩. কনটেন্ট আপডেট (Modern Formatting)
                const formattedDescription = rule.description 
                    ? rule.description.split('\n').map(line => {
                        if (line.trim() === '') return '<br>';
                        return `<div class="rule-bullet"><i class="fas fa-check-circle"></i> <span>${line}</span></div>`;
                      }).join('') 
                    : '<p style="opacity: 0.7;">No details available.</p>';

                contentContainer.innerHTML = `
                    <div style="animation: fadeIn 0.3s ease;">
                        <h3 style="margin-bottom: 20px; color: var(--primary); font-size: 18px; font-weight: 800; border-bottom: 1px dashed rgba(59, 130, 246, 0.3); padding-bottom: 10px;">
                            ${rule.title}
                        </h3>
                        <div>
                            ${formattedDescription}
                        </div>
                    </div>
                `;
                
                document.querySelector('.rp-content-wrapper').scrollTop = 0;
            };

            tabsContainer.appendChild(btn);

            // প্রথমটি অটো-সিলেক্ট
            if (isFirst) {
                btn.click(); 
                isFirst = false;
            }
        });
    }
});

            
            supportBtn.addEventListener('click', () => {
    infoModalTitle.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
            <div style="background:var(--primary); padding:8px 10px; border-radius:12px; color:white; font-size:14px; box-shadow:0 4px 10px rgba(99,102,241,0.3);">
                <i class="fas fa-headset"></i>
            </div> 
            <span style="font-weight:800;">Support Center</span>
        </div>`;
    
    infoModalContent.innerHTML = `
        <div style="display:flex; justify-content:center; padding:50px;">
            <i class="fas fa-circle-notch fa-spin" style="font-size:35px; color:var(--primary);"></i>
        </div>`;
    
    infoModal.classList.add('active');

    database.ref('support').once('value').then(supportSnap => {
        const supportData = supportSnap.val() || {};
        let html = '';

        // --- Premium Header Banner ---
        html += `
            <div class="support-banner-pro">
                <h3 style="font-size: 20px; font-weight: 800; color: var(--text-light); margin-bottom: 6px;">Need Help?</h3>
                <p style="font-size: 13px; color: var(--gray); font-weight: 500; margin:0;">Our support team is ready to assist you. Choose a platform below.</p>
            </div>
        `;

        if (Object.keys(supportData).length === 0) {
            html += `
                <div style="text-align:center; padding: 40px 20px; background: var(--card-light); border-radius:20px; border:2px dashed #cbd5e1;">
                    <i class="fas fa-comment-dots" style="font-size:45px; color:#cbd5e1; margin-bottom:15px;"></i>
                    <p style="color:var(--gray); font-size:15px; font-weight:700; margin:0;">No support channels available.</p>
                </div>
            `;
        } else {
            html += '<div class="support-grid">';
            
            Object.values(supportData).forEach(item => {
                const isOnline = item.status === 'online';
                
                // Image Parsing Logic
                let finalImg = 'https://placehold.co/100/e2e8f0/64748b?text=Support';
                if (item.image && item.image.includes('src="')) {
                    const match = item.image.match(/src="([^"]+)"/);
                    if (match) finalImg = match[1];
                } else if (item.image && item.image.trim() !== '') {
                    finalImg = item.image;
                }
                
                // Dynamic Classes based on status
                const dotClass = isOnline ? 'dot-online' : 'dot-offline';
                const badgeClass = isOnline ? 'badge-online' : 'badge-offline';
                const statusText = isOnline ? 'ONLINE' : 'OFFLINE';
                const iconClass = isOnline ? 'fa-bolt' : 'fa-moon';
                const defaultMsg = isOnline ? 'Ready to help' : 'Currently away';

                html += `
                    <a href="${item.link}" target="_blank" class="support-card-pro" ${!isOnline ? 'style="opacity: 0.8;"' : ''}>
                        
                        ${isOnline ? '<div style="position:absolute; left:0; top:0; bottom:0; width:4px; background:var(--success);"></div>' : ''}
                        
                        <div class="support-avatar-box">
                            <img src="${finalImg}" onerror="this.src='https://placehold.co/100/e2e8f0/64748b?text=S'" class="support-avatar-img">
                            <div class="support-status-dot ${dotClass}"></div>
                        </div>
                        
                        <div class="support-info-pro">
                            <div class="support-name">
                                ${item.name}
                                <span class="support-badge ${badgeClass}">${statusText}</span>
                            </div>
                            <div class="support-desc">
                                <i class="fas ${iconClass}"></i> 
                                ${item.message || defaultMsg}
                            </div>
                        </div>
                        
                        <div class="support-action-btn">
                            <i class="fas fa-paper-plane" style="font-size:14px; margin-left:-2px;"></i>
                        </div>
                    </a>
                `;
            });
            html += '</div>';
        }

        // Dark mode adjustments are now handled entirely by CSS classes!
        infoModalContent.innerHTML = html;
        
        // Dark mode color text fix for the banner
        if(document.body.classList.contains('dark-mode')) {
             infoModalContent.querySelectorAll('.support-banner-pro h3').forEach(el => el.style.color = 'var(--text-dark)');
        }
    });
});


            
            tasksBtn.addEventListener('click', () => {
    openDailyTask(); // এখন আর মডাল না, সরাসরি ফুল-পেজ ওপেন হবে
    loadTasks(); // <--- পেজ ওপেন হওয়ার সাথে সাথে টাস্ক লোড করার জন্য এটি যোগ করা হলো
});



            historyBtn.addEventListener('click', () => {
    loadTransactions();
    switchSection('history'); // Modal ওপেন না করে সরাসরি নতুন পেজে নিয়ে যাবে
    window.scrollTo({ top: 0, behavior: 'smooth' }); // পেজের শুরুতে স্ক্রল করবে
});


            // UPDATED: Redeem Code Logic
            
            applyRedeemBtn.addEventListener('click', () => {
    const codeInput = document.getElementById('promoCodeInput');
    const code = codeInput.value.trim();

    if (!code) {
        alert("Please enter a code.");
        return;
    }

    applyRedeemBtn.disabled = true;
    applyRedeemBtn.textContent = "Processing...";

    database.ref('redeemCodes').orderByChild('code').equalTo(code).once('value')
        .then(snapshot => {
            if (!snapshot.exists()) {
                throw new Error("Invalid Redeem Code");
            }

            const id = Object.keys(snapshot.val())[0];
            const data = snapshot.val()[id];

            // ১. চেক করা কোড অ্যাক্টিভ কিনা
            if (data.status !== 'active') {
                throw new Error("This code is inactive.");
            }

            // ২. চেক করা লিমিট শেষ কিনা
            const currentUsers = data.currentUsers || 0;
            const maxUsers = data.maxUsers || 1; 

            if (currentUsers >= maxUsers) {
                throw new Error("This code limit has been reached (Full).");
            }

            // ৩. চেক করা ইউজার আগে ব্যবহার করেছে কিনা
            if (data.usageLogs) {
                const alreadyUsed = Object.values(data.usageLogs).some(log => log.userId == appState.userId);
                if (alreadyUsed) {
                    throw new Error("You have already used this code.");
                }
            }

            // --- সব ঠিক থাকলে ব্যালেন্স অ্যাড এবং লগ তৈরি ---
            
            const updates = {};
            const now = Date.now();

            // A. কোডের ডাটা আপডেট (Current User + 1 এবং Log)
            updates[`/redeemCodes/${id}/currentUsers`] = currentUsers + 1;
            
            const newLogKey = database.ref(`redeemCodes/${id}/usageLogs`).push().key;
            updates[`/redeemCodes/${id}/usageLogs/${newLogKey}`] = {
                userId: appState.userId,
                userName: appState.currentUser.firstName + " " + (appState.currentUser.lastName || ""),
                userUsername: appState.currentUser.username || "n/a",
                date: now
            };

            // B. ট্রানজেকশন হিস্ট্রি আপডেট
            const newTxnKey = database.ref('transactions').push().key;
            updates[`/transactions/${newTxnKey}`] = {
                userId: appState.userId,
                type: 'deposit',
                amount: data.amount,
                date: now,
                status: 'success',
                method: 'Redeem Code',
                title: `Redeemed: ${code}`
            };

            // C. ইউজারের ব্যালেন্স আপডেট
            return database.ref('users/' + appState.userId).once('value').then(userSnap => {
                const currentBal = parseFloat(userSnap.val()?.balance || 0);
                const newBal = currentBal + parseFloat(data.amount);
                const totalDep = parseFloat(userSnap.val()?.totalDeposit || 0) + parseFloat(data.amount);

                updates[`/users/${appState.userId}/balance`] = newBal;
                updates[`/users/${appState.userId}/totalDeposit`] = totalDep;

                return database.ref().update(updates);
            });
        })
        .then(() => {
            alert("Success! Balance Added.");
            redeemModal.classList.remove('active');
            codeInput.value = "";
            if(typeof loadRedeemHistory === 'function') loadRedeemHistory();
            loadUserProfile(); // ব্যালেন্স রিফ্রেশ
        })
        .catch(error => {
            alert(error.message);
        })
        .finally(() => {
            applyRedeemBtn.disabled = false;
            applyRedeemBtn.textContent = "Apply Code";
        });
});


            joinTypeSelect.addEventListener('change', updatePlayerInputs);
            
            joinForm.addEventListener('submit', function(e) {
                e.preventDefault();
                joinMatch();
            });
            
            
            
            document.addEventListener('click', function(e) {
    const copyBtn = e.target.closest('.copy-btn');
    if (copyBtn) {
        e.preventDefault(); 
        
        // প্রথমে data-text থেকে নেয়ার চেষ্টা করবে
        let text = copyBtn.getAttribute('data-text');
        
        // যদি data-text ফাঁকা থাকে, তবে স্মার্টলি পাশের স্প্যান থেকে টেক্সট খুঁজে নিবে
        if (!text) {
            const parentBox = copyBtn.closest('.value, .mc-room-code-box, .copy-number-box');
            if (parentBox) {
                const span = parentBox.querySelector('span');
                if (span) text = span.textContent.trim();
            }
        }

        // যদি কোনো টেক্সট না থাকে বা "Waiting..." লেখা থাকে, তাহলে কপি হবে না
        if (!text || text === "Waiting...") return;

        // কপি ফাংশন কল করা হলো
        copyToClipboard(text);
        
        // বাটনের আইকন পরিবর্তন (সাকসেস এনিমেশন)
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        copyBtn.style.color = 'var(--success)';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            copyBtn.style.color = '';
        }, 2000);
    }
});


        }

        function switchSection(sectionId) {
    footerBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === sectionId);
    });
    
    sections.forEach(section => {
        section.classList.toggle('active', section.id === `${sectionId}-section`);
    });

          // --- Header Logic (Updated) ---
    // শুধুমাত্র Play সেকশনে মেইন হেডার দেখাবে, অন্যথায় হাইড থাকবে
    const mainHeader = document.getElementById('mainHeader'); 
    if (mainHeader) {
        if (sectionId === 'play') {
            // চেক করা হচ্ছে ইউজার বর্তমানে কোনো ক্যাটাগরির ভেতরে আছে কিনা
            const isMatchListActive = document.getElementById('matchListView').style.display === 'block';
            // যদি ইউজার ক্যাটাগরির ভেতরে থাকে তাহলে none, নাহলে flex
            mainHeader.style.display = isMatchListActive ? 'none' : 'flex';
        } else {
            mainHeader.style.display = 'none';
        }
    }
    // -----------------------------


        // Notice banner এবং Premium banner লজিক আপডেট
    const banner = document.getElementById('noticeBanner');
    const premiumBanner = document.getElementById('premiumBannerSlider');
    const hasPremiumBanners = document.getElementById('bannerSlidesWrapper')?.children.length > 0;

    if (sectionId === 'play') {
        const isMatchListActive = document.getElementById('matchListView').style.display === 'block';
        banner.style.display = isMatchListActive ? 'none' : 'flex';
        if (premiumBanner) {
            premiumBanner.style.display = (isMatchListActive || !hasPremiumBanners) ? 'none' : 'block';
        }
    } else {
        banner.style.display = 'none';
        if (premiumBanner) premiumBanner.style.display = 'none'; // অন্যান্য পেজে লুকানো থাকবে
    }

    // - switchSection ফাংশনের ভিতরের মিউজিক লজিক আপডেট করুন

const ldAudio = document.getElementById('ldMusicPlayer');
if (sectionId === 'luckydraw') {
    database.ref('settings/ldMusicUrl').once('value').then(snap => {
        const url = snap.val();
        if (url) {
            // যদি গান আগে থেকেই লোড করা থাকে, শুধু play করো
            if (ldAudio.src === url) {
                ldAudio.currentTime = 0; // গান শুরু থেকে বাজানোর জন্য
                ldAudio.play().catch(e => console.log("Music play blocked"));
            } else {
                // নতুন URL হলে সেট করে প্লে করো
                ldAudio.src = url;
                ldAudio.play().catch(e => console.log("Music play blocked"));
            }
        }
    });
} else {
    if (ldAudio) {
        ldAudio.pause();
    }
}


    appState.currentSection = sectionId;
    
    switch(sectionId) {
        case 'play':
            loadMatches();
            break;
        case 'esports':
            loadEsports(); 
            break;
        case 'my-matches':
            loadMyMatches();
            break;
        case 'results':
            loadResults();
            break;
        case 'profile':
            loadUserProfile();
            break;
    }
}


        function switchCategory(categoryId) {
            categories.forEach(category => {
                category.classList.toggle('active', category.getAttribute('data-category') === categoryId);
            });
            
            appState.currentCategory = categoryId;
            filterMatchesByCategory();
        }

        function toggleTheme() {
            if (appState.darkMode) {
                disableDarkMode();
            } else {
                enableDarkMode();
            }
        }

        function enableDarkMode() {
            document.body.classList.add('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            appState.darkMode = true;
            localStorage.setItem('theme', 'dark');
        }

        function disableDarkMode() {
            document.body.classList.remove('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            appState.darkMode = false;
            localStorage.setItem('theme', 'light');
        }

        function loadNotice() {
    database.ref('announcement/message').on('value', (snapshot) => {
        const notice = snapshot.val() || "Welcome to Battle Royale Tournament! Check out our new matches.";
        // textContent এর বদলে innerHTML ব্যবহার করুন
        noticeText.innerHTML = notice; 
    });
}



        function loadMatches() {
    database.ref('matches').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            appState.matches = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
            appState.matches.sort((a, b) => a.startTime - b.startTime);
        } else {
            appState.matches = [];
        }
        
        // --- নতুন যোগ করা লাইন ---
        renderCategoryGrid(); 
        // -------------------------

        renderMatches();
        startMatchTimers();
    });
}

        // loadMatches ফাংশনের ঠিক নিচে এটি পেস্ট করুন
function fetchUserJoinedMatches() {
    if (!appState.userId) return;

    database.ref('users/' + appState.userId + '/myMatches').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            appState.myMatches = Object.values(data);
        } else {
            appState.myMatches = [];
        }
        
        renderMatches(); 
        if (appState.currentSection === 'my-matches') {
            loadMyMatches(); 
        }
    });
}



        function renderMatches() {
            const filteredMatches = filterMatches();
            
            if (filteredMatches.length === 0) {
                matchesContainer.innerHTML = noMatches.outerHTML;
                return;
            }
            
            matchesContainer.innerHTML = '';
            
            filteredMatches.forEach(match => {
                const matchCard = createMatchCard(match);
                matchesContainer.appendChild(matchCard);
            });
        }

        function filterMatches() {
    
    let activeMatches = appState.matches.filter(match => match.status !== 'ended');

    if (appState.currentCategory === 'all') {
        return activeMatches;
    }
    return activeMatches.filter(match => match.category === appState.currentCategory);
}


        function createMatchCard(match) {
    const card = document.createElement('div');
    card.className = 'match-card-ultra';
    card.setAttribute('data-match-id', match.id);

    // Date & Time Logic
    const matchDate = new Date(match.startTime);
    const dateStr = matchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); 
    const timeStr = matchDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }); 
    const timeLeft = match.startTime - Date.now();
    const countdownText = formatTimeLeft(timeLeft);

    // Slots Logic
    const isJoined = appState.myMatches && appState.myMatches.some(m => m.matchId === match.id);
    const totalSlots = match.slots.total;
    const availableSlots = Math.max(0, match.slots.available);
    const joinedCount = totalSlots - availableSlots;
    const progressPercent = totalSlots > 0 ? (joinedCount / totalSlots) * 100 : 0;

    // Status Badge & Timer
    let statusClass = 'upcoming';
    let statusText = 'UPCOMING';
    let timerDisplay = `Starts in <br> <span class="countdown" data-end-time="${match.startTime}" style="color:var(--primary); font-size:12px;">${countdownText}</span>`;

    if (match.status === 'playing') {
        statusClass = 'live';
        statusText = '<i class="fas fa-satellite-dish"></i> LIVE';
        timerDisplay = 'Match is running';
        card.classList.add('live-animation');
    } else if (match.status === 'ended') {
        statusClass = 'ended';
        statusText = 'ENDED';
        timerDisplay = 'Match finished';
    }

    // Button Logic
    let btnClass = 'mcu-join-btn';
    let btnText = 'JOIN NOW';
    let btnDisabled = false;

    if (match.status !== 'playing' && match.status !== 'ended') {
        if (isJoined) {
            btnText = '<i class="fas fa-check"></i> JOINED';
            btnClass += ' joined';
            btnDisabled = true;
        } else if (availableSlots <= 0) {
            btnText = 'SLOTS FULL';
            btnClass += ' full';
            btnDisabled = true;
        }
    } else {
        btnText = 'CLOSED';
        btnClass += ' full';
        btnDisabled = true;
    }

    // Secret Room UI (If Joined)
    let roomHtml = '';
    if (isJoined && match.roomId && match.roomPassword) {
        roomHtml = `
            <div class="mcu-secret-box">
                <div class="mcp-sr-item">
                    <div class="mcp-sr-label">Room ID</div>
                    <div class="mcp-sr-val">
                        ${match.roomId} 
                        <i class="fas fa-copy copy-btn" data-text="${match.roomId}" style="color:var(--gray); cursor:pointer;"></i>
                    </div>
                </div>
                <div style="width:1px; background:rgba(16,185,129,0.3);"></div>
                <div class="mcp-sr-item">
                    <div class="mcp-sr-label">Password</div>
                    <div class="mcp-sr-val">
                        ${match.roomPassword} 
                        <i class="fas fa-copy copy-btn" data-text="${match.roomPassword}" style="color:var(--gray); cursor:pointer;"></i>
                    </div>
                </div>
            </div>
        `;
    }

    // Assemble Ultra Structured Card
    card.innerHTML = `
        <div class="mcu-header">
            <div class="mcu-badge-row">
                <div class="mcu-type"><i class="fas fa-gamepad"></i> ${match.type} • #${match.id}</div>
                <div class="mcu-status ${statusClass}">${statusText}</div>
            </div>
            <div class="mcu-title-row">
                <div class="mcu-title">${match.title}</div>
                <div class="mcu-time"><i class="far fa-calendar-alt"></i> ${dateStr}<br>${timeStr}</div>
            </div>
        </div>

        <div class="mcu-stats-box">
            <div class="mcu-stat">
                <span>Prize Pool</span>
                <strong class="prize-color">৳${match.prizePool}</strong>
            </div>
            <div class="mcu-stat">
                <span>Per Kill</span>
                <strong>৳${match.perKill}</strong>
            </div>
            <div class="mcu-stat">
                <span>Entry</span>
                <strong>${match.entryFee === 0 ? 'FREE' : '৳'+match.entryFee}</strong>
            </div>
        </div>

        ${roomHtml}

        <div class="mcu-footer">
            <div class="mcu-progress-row">
                <div class="mcu-prog-text"><i class="fas fa-users" style="color:var(--primary);"></i> ${joinedCount} / ${totalSlots}</div>
                <div class="mcu-prog-bar-bg">
                    <div class="mcu-prog-fill" style="width: ${progressPercent}%;"></div>
                </div>
                ${match.status === 'upcoming' ? `<div style="font-size:11px; font-weight:700; color:var(--gray); text-align:right;">${timerDisplay}</div>` : ''}
            </div>
            
            <div class="mcu-action-row">
                <div class="mcu-icon-group">
                    <button class="mcu-icon-btn view-prize" title="Prizes"><i class="fas fa-gift"></i></button>
                    <button class="mcu-icon-btn view-part" title="Participants"><i class="fas fa-list-ul"></i></button>
                    <button class="mcu-icon-btn view-rules" title="Rules"><i class="fas fa-info-circle"></i></button>
                </div>
                <button class="${btnClass}" ${btnDisabled ? 'disabled' : ''}>${btnText}</button>
            </div>
        </div>
    `;

    // Bind Event Listeners
    const joinBtn = card.querySelector('.mcu-join-btn:not([disabled])');
    if (joinBtn) joinBtn.addEventListener('click', () => openJoinModal(match));
    
    card.querySelector('.view-prize').addEventListener('click', () => openPrizePoolModal(match));
    card.querySelector('.view-part').addEventListener('click', () => openParticipantsModal(match));
    card.querySelector('.view-rules').addEventListener('click', () => document.getElementById('rulesBtn').click());

    return card;
}




        function openParticipantsModal(match) {
    participantsListContent.innerHTML = ''; 
    
    const players = match.participants || [];
    
    if (players.length === 0) {
        participantsListContent.innerHTML = `
            <div class="no-data" style="padding: 20px;">
                <i class="fas fa-users" style="font-size:32px;"></i>
                <p>No participants yet</p>
            </div>`;
    } else {
        players.forEach((player, index) => {
            // এই লাইনটি সমস্যা সমাধান করবে
            // এটি চেক করবে player কি সরাসরি নাম নাকি একটি অবজেক্ট
            let displayName = player;
            
            if (typeof player === 'object' && player !== null) {
                displayName = player.playerName || 'Unknown';
            }

            const item = document.createElement('div');
            item.className = 'participant-item';
            item.innerHTML = `
                <div class="participant-serial">${index + 1}</div>
                <div class="participant-name">${displayName}</div>
            `;
            participantsListContent.appendChild(item);
        });
    }
    
    participantsModal.classList.add('active');
}


        function openPrizePoolModal(match) {
    prizePoolContent.innerHTML = '';
    
    const distribution = match.prizeDistribution || [];
    
    if (distribution.length === 0) {
        prizePoolContent.innerHTML = `
            <div class="no-data" style="padding: 20px;">
                <i class="fas fa-gift" style="font-size:32px;"></i>
                <p>No breakdown available</p>
            </div>`;
    } else {
        let tableHTML = `
            <table class="prize-table" style="width:100%;">
                <thead>
                    <tr>
                        <th style="text-align:left; padding:10px;">Rank</th>
                        <th style="text-align:right; padding:10px;">Reward</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        distribution.forEach(item => {
            tableHTML += `
                <tr>
                    <td class="prize-rank" style="text-align:left; padding:10px;">${item.rank}</td>
                    <td class="prize-amount" style="text-align:right; padding:10px; color:var(--success); font-weight:bold;">৳${item.reward}</td>
                </tr>
            `;
        });
        
        tableHTML += `</tbody></table>`;
        prizePoolContent.innerHTML = tableHTML;
    }
    
    prizePoolModal.classList.add('active');
}

        
        function filterMatchesByCategory() {
            renderMatches();
        }

                

        
        function startMatchTimers() {
    setInterval(() => {
        const countdowns = document.querySelectorAll('.countdown');
        
        countdowns.forEach(countdown => {
            const endTime = parseInt(countdown.getAttribute('data-end-time'));
            if (isNaN(endTime)) return;

            const timeLeft = endTime - Date.now();
            
            if (timeLeft > 0) {
                countdown.textContent = formatTimeLeft(timeLeft);
            } else {
                if(countdown.textContent === 'LIVE') return;

                countdown.textContent = '00:00:00';
                
                // স্ট্যাটাস আপডেট ভিজ্যুয়াল
                const matchCard = countdown.closest('.match-card');
                
                if (matchCard) {
                    // ১. ৩ডি অ্যানিমেশন ক্লাস যোগ করুন
                    matchCard.classList.add('live-animation');

                    // ২. জয়েন বাটন লুকিয়ে ফেলুন
                    const joinBtn = matchCard.querySelector('.join-btn');
                    if(joinBtn) {
                        joinBtn.style.display = 'none';
                    }
                    
                    // ৩. ফুটার অ্যাডজাস্ট করুন (টাইমার মাঝখানে আনার জন্য)
                    const footer = matchCard.querySelector('.mc-footer');
                    if(footer) footer.style.justifyContent = 'center';

                    // ৪. টাইমার টেক্সট আপডেট করুন
                    const timerDiv = matchCard.querySelector('.mc-timer');
                    if (timerDiv) {
                        timerDiv.classList.remove('upcoming');
                        timerDiv.classList.add('live');
                        timerDiv.innerHTML = `<i class="fas fa-circle"></i> LIVE NOW`;
                    }
                } else {
                    // ইস্পোর্টসের জন্য ফলব্যাক
                    const esItem = countdown.closest('.esports-match-item');
                    if(esItem) {
                         const timerDiv = esItem.querySelector('.mc-timer');
                         if(timerDiv) {
                            timerDiv.classList.remove('upcoming');
                            timerDiv.classList.add('live');
                            timerDiv.innerHTML = 'Live Now';
                         }
                    }
                }
            }
        });
    }, 1000);
}

        
        function startLuckyDrawTimers() {
            setInterval(() => {
                const countdowns = document.querySelectorAll('.ld-countdown');
                const now = Date.now();

                countdowns.forEach(countdown => {
                    const endTime = parseInt(countdown.getAttribute('data-end-time'));
                    if (isNaN(endTime)) return;

                    const timeLeft = endTime - now;

                    if (timeLeft > 0) {
                        // এটি আপনার আগের formatTimeLeft ফাংশনটি ব্যবহার করবে
                        countdown.textContent = formatTimeLeft(timeLeft);
                    } else {
                        // টাইমার ০ তে পৌঁছালে অটোমেটিক বাটন লক করে দেবে (পেজ রিলোড ছাড়াই)
                        if (countdown.textContent === 'Draw Closed') return;
                        
                        countdown.textContent = 'Draw Closed';
                        
                        const badge = countdown.closest('.ld-badge-time');
                        if (badge) {
                            badge.style.background = 'rgba(239, 68, 68, 0.8)';
                            badge.style.color = 'white';
                        }
                        
                        // অটোমেটিক পারচেজ বাটন বন্ধ করে দেওয়া
                        const card = countdown.closest('.ld-premium-card');
                        if (card) {
                            const btn = card.querySelector('.ld-action-btn');
                            if (btn && !btn.disabled) {
                                btn.disabled = true;
                                btn.innerHTML = '<i class="fas fa-lock"></i> Draw Closed';
                                btn.style.background = '#475569';
                                btn.style.boxShadow = 'none';
                                btn.style.color = '#94a3b8';
                                btn.style.cursor = 'not-allowed';
                                
                                // Quantity ইনপুট বক্স থাকলে তা লুকিয়ে ফেলা
                                const qtyInput = card.querySelector('.ld-action-area > div');
                                if(qtyInput) qtyInput.style.display = 'none';
                            }
                        }
                    }
                });
            }, 1000);
        }
        
        function formatTimeLeft(milliseconds) {
            if (milliseconds <= 0) return '00:00:00';
            
            const secondsTotal = Math.floor(milliseconds / 1000);
            const days = Math.floor(secondsTotal / (3600 * 24));
            const hours = Math.floor((secondsTotal % (3600 * 24)) / 3600);
            const minutes = Math.floor((secondsTotal % 3600) / 60);
            const seconds = secondsTotal % 60;
            
            const h = hours.toString().padStart(2, '0');
            const m = minutes.toString().padStart(2, '0');
            const s = seconds.toString().padStart(2, '0');

            if (days > 0) {
                return `${days}d ${h}:${m}:${s}`;
            }
            return `${h}:${m}:${s}`;
        }

        
        function openJoinModal(match) {
    // আগে চেক করা ইউজার জয়েন করেছে কিনা বা স্লট আছে কিনা
    if (appState.myMatches.some(m => m.matchId === match.id)) {
        alert('You have already joined this match!');
        return;
    }
    if (match.slots.available <= 0) {
        alert('This match is full!');
        return;
    }

    // ভ্যালু সেট করা
    document.getElementById('selectedMatchId').value = match.id;
    document.getElementById('selectedMatchType').value = match.type;
    
    // --- নতুন লজিক শুরু (Dynamic Dropdown) ---
    const joinSelect = document.getElementById('joinType');
    joinSelect.innerHTML = ''; // আগের অপশন মুছে ফেলা

    // Admin Panel থেকে 'type' সাধারণত "Solo", "Duo", "Squad" হিসেবে আসে
    const matchType = match.type.toLowerCase(); // ছোট হাতের অক্ষরে কনভার্ট (solo, duo, squad)

    // ১. Solo অপশন সবসময় থাকবে (আপনার লজিক অনুযায়ী)
    const optSolo = document.createElement('option');
    optSolo.value = 'solo';
    optSolo.innerText = 'Solo';
    joinSelect.appendChild(optSolo);

    // ২. যদি ম্যাচ Duo বা Squad হয়, তবে Duo অপশন যোগ হবে
    if (matchType === 'duo' || matchType === 'squad') {
        const optDuo = document.createElement('option');
        optDuo.value = 'duo';
        optDuo.innerText = 'Duo';
        joinSelect.appendChild(optDuo);
    }

    // ৩. যদি ম্যাচ Squad হয়, তবে Squad অপশন যোগ হবে
    if (matchType === 'squad') {
        const optSquad = document.createElement('option');
        optSquad.value = 'squad';
        optSquad.innerText = 'Squad';
        joinSelect.appendChild(optSquad);
    }
    // --- নতুন লজিক শেষ ---

    // রুলস টেক্সট আপডেট
    let rulesText = '';
    switch(match.type) {
        case 'esports':
            rulesText = 'Only Squad (4 players mandatory)';
            break;
        case 'lone':
            rulesText = 'Solo or Duo only';
            break;
        default:
            rulesText = 'Solo: 1 FF Name, Duo: 2 FF Names, Squad: 4 FF Names';
    }
    joinRulesText.textContent = rulesText;

    // ডিফল্ট সিলেক্ট অনুযায়ী ইনপুট বক্স আপডেট করা
    updatePlayerInputs();
    
    // মডাল ওপেন করা
    joinModal.classList.add('active');
}





        function updatePlayerInputs() {
            const joinType = joinTypeSelect.value;
            let playerCount = 1;
            
            if (joinType === 'duo') playerCount = 2;
            if (joinType === 'squad') playerCount = 4;
            
            playerNamesContainer.innerHTML = '';
            
            for (let i = 0; i < playerCount; i++) {
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'form-input player-name';
                input.placeholder = `Player ${i+1} FF Name`;
                input.required = true;
                playerNamesContainer.appendChild(input);
            }
        }

  async function joinMatch() {
    const matchId = document.getElementById('selectedMatchId').value;
    const joinType = document.getElementById('joinType').value;
    
    // ইনপুট থেকে প্লেয়ারদের নাম সংগ্রহ করা
    const playerInputs = playerNamesContainer.querySelectorAll('.player-name');
    const playerNames = Array.from(playerInputs).map(input => input.value.trim());
    
    if (playerNames.some(name => name === '')) {
        alert('Please fill in all player names');
        return;
    }

    // বাটন লোডিং স্টেট (যাতে ইউজার বারবার ক্লিক করতে না পারে)
    const submitBtn = document.querySelector('#joinForm button[type="submit"]');
    let originalText = "";
    if (submitBtn) {
        originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    }

    try {
        // Cloudflare Worker-এ সিকিউর রিকোয়েস্ট পাঠানো
        const response = await fetch(CLOUDFLARE_WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                initData: tg.initData,
                action: "join-match",
                matchId: matchId,
                joinType: joinType,
                players: playerNames
            })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            alert("🎉 " + result.message);
            joinModal.classList.remove('active'); // সফল হলে মোডাল বন্ধ করে দেবে
            // আপনার ফায়ারবেস লিসেনার নিজে থেকেই ব্যালেন্স এবং স্লট আপডেট করে নেবে
        } else {
            alert("❌ " + (result.error || "Failed to join match."));
        }
    } catch (error) {
        console.error("Join Match Error:", error);
        alert("Network error! Please check your internet connection and try again.");
    } finally {
        // বাটন আবার স্বাভাবিক অবস্থায় ফিরিয়ে আনা
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
}


// এই ফাংশনটি loadEsports() এর ঠিক উপরে বসান
function switchEsportsHistoryTab(tabType) {
    currentEsportsHistoryTab = tabType;

    // বাটন ডিজাইন আপডেট
    document.getElementById('esHistTab_all').classList.remove('active');
    document.getElementById('esHistTab_my').classList.remove('active');
    document.getElementById(`esHistTab_${tabType}`).classList.add('active');

    // ডাটা রিফ্রেশ
    renderEsports();
}



  
        // --- ESPORTS LOGIC ---

        function loadEsports() {
            // 1. Load Matches
            database.ref('esports/matches').on('value', (snapshot) => {
                const matches = snapshot.val() || {};
                appState.esportsData.matches = Object.keys(matches).map(key => ({
                    id: key,
                    ...matches[key]
                }));
                checkEsportsRegistrations();
                renderEsports(); // Trigger UI Update
            });

            // 3. Load History
            appState.esportsData.history = [
                // { title: "Season 1", winner: "Alpha", date: "..." } 
            ];
        }

        function checkEsportsRegistrations() {
            appState.esportsData.registrations = {};
            appState.esportsData.counts = {}; 

            const checkPromises = appState.esportsData.matches.map(match => {
                return database.ref(`esports/registrations/${match.id}`).once('value').then(snap => {
                    const registrations = snap.val() || {};
                    let isRegistered = false;
                    
                    const count = Object.keys(registrations).length;
                    appState.esportsData.counts[match.id] = count;

                    Object.values(registrations).forEach(reg => {
                        if (reg.userId === appState.userId) {
                            isRegistered = true;
                        }
                    });
                    
                    appState.esportsData.registrations[match.id] = isRegistered;
                });
            });

            Promise.all(checkPromises).then(() => {
                renderEsports();
            });
        }

       function renderEsports() {
    // --- 1. Matches Tab (The Elite Design) ---
    const matchesView = document.getElementById('esportsMatchesView');
    const activeMatches = appState.esportsData.matches.filter(m => m.status !== 'finished');

    if (activeMatches.length > 0) {
        let html = '';
        
        const sortedMatches = activeMatches.sort((a, b) => {
            const statusOrder = { 'live': 1, 'upcoming': 2 };
            return (statusOrder[a.status] || 3) - (statusOrder[b.status] || 3);
        });

        sortedMatches.forEach(match => {
            const isLive = match.status === 'live';
            const statusClass = isLive ? 'live' : 'upcoming';
            const statusHTML = isLive ? '<div class="dot"></div> LIVE NOW' : '<i class="fas fa-bolt"></i> UPCOMING';
            
            let timerHTML = '';
            if (!isLive && match.rawTime) {
                const matchTime = new Date(match.rawTime).getTime();
                const timeLeft = matchTime - Date.now();
                const countdownText = formatTimeLeft(timeLeft);
                timerHTML = `<div class="emc-timer countdown" data-end-time="${matchTime}"><i class="fas fa-clock" style="color:#fcd34d;"></i> Starts in ${countdownText}</div>`;
            } else if (isLive) {
                timerHTML = `<div class="emc-timer" style="color:#fca5a5; border-color:rgba(239,68,68,0.3);"><i class="fas fa-satellite-dish"></i> Match Running</div>`;
            }

            const isRegistered = appState.esportsData.registrations[match.id];
            const joinedCount = appState.esportsData.counts[match.id] || 0;
            const limit = parseInt(match.squadLimit) || 12; 
            const isFull = joinedCount >= limit;
            let progressPercent = limit > 0 ? (joinedCount / limit) * 100 : 0;
            
            let btnHTML = '';
            if (!isLive) {
                if (isRegistered) {
                    btnHTML = `<button class="emc-btn joined" disabled><i class="fas fa-check-circle"></i> Joined</button>`;
                } else if (isFull) {
                    btnHTML = `<button class="emc-btn full" disabled><i class="fas fa-ban"></i> Full</button>`;
                } else {
                    btnHTML = `<button class="emc-btn" onclick="openEsportsJoinModal('${match.id}')">Register</button>`;
                }
            } else {
                 btnHTML = `<button class="emc-btn full" disabled>Closed</button>`;
            }

            const entryDisplay = match.entryFee > 0 ? `৳${match.entryFee}` : 'FREE';

            html += `
                <div class="elite-match-card">
                    <div class="emc-banner">
                        <div class="emc-status ${statusClass}">${statusHTML}</div>
                        ${timerHTML}
                    </div>
                    
                    <div class="emc-content">
                        <div class="emc-main-info">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                <div>
                                    <div class="emc-title">${match.title}</div>
                                    <div class="emc-subtitle"><i class="far fa-calendar-alt" style="color:var(--primary);"></i> ${match.matchTime || 'TBA'} • ${match.map || 'Any Map'}</div>
                                </div>
                                <button class="emc-secondary-btn" onclick="showEsportsRoom('${match.id}')" title="Get Room ID">
                                    <i class="fas fa-key" style="color:#8b5cf6;"></i> Room
                                </button>
                            </div>
                            
                            <div class="emc-stats-row">
                                <div class="emc-stat">
                                    <div class="emc-stat-label">Entry</div>
                                    <div class="emc-stat-value">${entryDisplay}</div>
                                </div>
                                <div style="width:1px; background:rgba(148,163,184,0.3);"></div>
                                <div class="emc-stat">
                                    <div class="emc-stat-label">Prize Pool</div>
                                    <div class="emc-stat-value prize">৳${match.prizePool || 0}</div>
                                </div>
                                <div style="width:1px; background:rgba(148,163,184,0.3);"></div>
                                <div class="emc-stat">
                                    <div class="emc-stat-label">Format</div>
                                    <div class="emc-stat-value" style="font-size:16px; margin-top:2px;">SQUAD</div>
                                </div>
                            </div>
                        </div>

                        <div class="emc-action-area">
                            <div class="emc-progress-box" onclick="openEsportsParticipantsModal('${match.id}')" style="cursor:pointer;" title="View Teams">
                                <div class="emc-prog-text">
                                    <span><i class="fas fa-users" style="margin-right:4px;"></i> Teams Registered</span>
                                    <span>${joinedCount}/${limit}</span>
                                </div>
                                <div class="emc-prog-track">
                                    <div class="emc-prog-fill" style="width: ${progressPercent}%;"></div>
                                </div>
                            </div>
                            ${btnHTML}
                        </div>
                    </div>
                </div>
            `;
        });
        matchesView.innerHTML = html;
    } else {
        matchesView.innerHTML = `
            <div style="text-align:center; padding: 60px 20px; background: var(--card-light); border-radius: 24px; border: 1px dashed #cbd5e1;">
                <div style="width: 80px; height: 80px; background: rgba(59,130,246,0.1); border-radius: 50%; display: flex; justify-content: center; align-items: center; margin: 0 auto 20px;">
                    <i class="fas fa-gamepad" style="font-size: 35px; color: var(--primary);"></i>
                </div>
                <h3 style="font-size: 20px; font-weight: 900; color: var(--text-light); margin-bottom: 8px;">No Tournaments</h3>
                <p style="font-size: 14px; color: var(--gray); font-weight: 500;">New battles will be scheduled soon. Stay tuned!</p>
            </div>`;
    }

    // --- 2. Points Tab (Elite Compact Design) ---
    const pointsView = document.getElementById('esportsPointsView');
    const pointsMatches = appState.esportsData.matches.filter(m => m.status === 'live' || m.status === 'finished');

    if (pointsMatches.length > 0) {
        let html = '';
        pointsMatches.forEach(match => {
            const isFinished = match.status === 'finished';
            const iconColor = isFinished ? '#10b981' : '#ef4444';
            const badgeBg = isFinished ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)';
            
            html += `
                <div class="elite-match-card" style="margin-bottom:12px; border-radius:16px; padding: 15px 20px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="openSpecificPointsModal('${match.id}')">
                    <div style="display:flex; align-items:center; gap:15px;">
                        <div style="width:45px; height:45px; border-radius:12px; background:${badgeBg}; color:${iconColor}; display:flex; justify-content:center; align-items:center; font-size:20px;">
                            <i class="fas ${isFinished ? 'fa-flag-checkered' : 'fa-broadcast-tower'}"></i>
                        </div>
                        <div>
                            <div style="font-size:16px; font-weight:900; color:var(--text-light); line-height:1.2;">${match.title}</div>
                            <div style="font-size:11px; color:var(--gray); font-weight:700; margin-top:4px;">${match.matchTime || 'TBA'}</div>
                        </div>
                    </div>
                    <div class="emc-secondary-btn" style="padding:10px 15px;"><i class="fas fa-list-ol"></i> Standings</div>
                </div>
            `;
        });
        pointsView.innerHTML = html;
    } else {
        pointsView.innerHTML = `<div style="text-align:center; padding: 50px; color:var(--gray); font-weight:600;"><i class="fas fa-list-ol" style="font-size:30px; margin-bottom:10px; opacity:0.5;"></i><br>No standings available.</div>`;
    }

    // --- 3. History Tab (Elite Design) ---
    const historyContainer = document.getElementById('esportsHistoryListContainer');
    let finishedMatches = appState.esportsData.matches.filter(m => m.status === 'finished');

    finishedMatches.sort((a, b) => new Date(b.rawTime || 0) - new Date(a.rawTime || 0));
    if (currentEsportsHistoryTab === 'my') {
        finishedMatches = finishedMatches.filter(match => appState.esportsData.registrations[match.id]);
    }

    if (finishedMatches.length > 0) {
        let html = '';
        finishedMatches.forEach(match => {
            const isRegistered = appState.esportsData.registrations[match.id];
            const userStatusBadge = isRegistered ? `<span style="font-size:9px; background:linear-gradient(135deg,var(--primary),#8b5cf6); color:white; padding:3px 8px; border-radius:10px; margin-left:8px; vertical-align:middle; box-shadow:0 2px 5px rgba(59,130,246,0.4);">PLAYED</span>` : '';

            html += `
                <div class="elite-match-card" style="margin-bottom:12px; border-radius:16px; padding: 15px 20px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="openSpecificPointsModal('${match.id}')">
                    <div>
                        <div style="font-size:15px; font-weight:900; color:var(--text-light); margin-bottom:4px;">${match.title} ${userStatusBadge}</div>
                        <div style="font-size:11px; color:var(--gray); font-weight:700;"><i class="far fa-calendar-check"></i> Ended: ${match.matchTime || 'N/A'}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:9px; color:var(--gray); font-weight:800; text-transform:uppercase; letter-spacing:1px; margin-bottom:2px;">Prize Pool</div>
                        <div style="font-size:18px; font-weight:900; color:var(--success);"><span style="font-size:12px;">৳</span>${match.prizePool}</div>
                    </div>
                </div>
            `;
        });
        historyContainer.innerHTML = html;
    } else {
        let msg = currentEsportsHistoryTab === 'my' ? "You haven't played any tournaments yet" : "No tournament history available";
        historyContainer.innerHTML = `<div style="text-align:center; padding: 50px; color:var(--gray); font-weight:600;"><i class="fas fa-history" style="font-size:30px; margin-bottom:10px; opacity:0.5;"></i><br>${msg}</div>`;
    }
    
    startMatchTimers();
}

        // --- NEW FUNCTION TO SHOW SPECIFIC POINTS ---
        function openSpecificPointsModal(matchId) {
            const modalContent = document.getElementById('esportsMatchPointsContent');
            modalContent.innerHTML = '<div style="text-align:center; padding:20px;">Loading points...</div>';
            esportsMatchPointsModal.classList.add('active');

            // Fetch registrations for THIS specific match
            database.ref(`esports/registrations/${matchId}`).once('value').then(snapshot => {
                const registrations = snapshot.val() || {};
                
                if(Object.keys(registrations).length === 0) {
                    modalContent.innerHTML = `<div class="no-data"><p>No data found.</p></div>`;
                    return;
                }

                // Convert to array and sort
                const teams = Object.values(registrations).map(reg => {
                    const stats = reg.stats || { matches: 0, wins: 0, kills: 0, total: 0 };
                    return {
                        name: reg.squadName || 'Unknown',
                        matches: stats.matches || 0,
                        wins: stats.wins || 0,
                        kills: stats.kills || 0,
                        points: stats.total || 0
                    };
                }).sort((a, b) => b.points - a.points); // Sort descending

                // Build Table HTML
                let tableHTML = `
                    <div class="points-table-container">
                        <table class="points-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Team</th>
                                    <th>M</th> <th>W</th> <th>Kills</th>
                                    <th>Pts</th>
                                </tr>
                            </thead>
                            <tbody>
                `;

                teams.forEach((team, index) => {
                    const rank = index + 1;
                    const rankClass = rank <= 3 ? `rank-${rank}` : '';
                    tableHTML += `
                        <tr>
                            <td class="rank-cell ${rankClass}">#${rank}</td>
                            <td>${team.name}</td>
                            <td>${team.matches}</td>
                            <td>${team.wins}</td>
                            <td>${team.kills}</td>
                            <td><strong>${team.points}</strong></td>
                        </tr>
                    `;
                });

                tableHTML += `</tbody></table></div>`;
                modalContent.innerHTML = tableHTML;
            });
        }

        function openEsportsJoinModal(matchId) {
            document.getElementById('esportsSelectedMatchId').value = matchId;
            document.getElementById('esportsSquadName').value = '';
            
            const inputs = document.querySelectorAll('.es-player-name, .es-player-ign');
            inputs.forEach(input => input.value = '');
            
            esportsJoinModal.classList.add('active');
        }

        function submitEsportsRegistration() {
            const matchId = document.getElementById('esportsSelectedMatchId').value;
            const squadName = document.getElementById('esportsSquadName').value.trim();
            
            const nameInputs = document.querySelectorAll('.es-player-name');
            const ignInputs = document.querySelectorAll('.es-player-ign');
            
            let players = [];
            let isValid = true;

            for(let i = 0; i < 4; i++) {
                const name = nameInputs[i].value.trim();
                const ign = ignInputs[i].value.trim();
                
                if(!name || !ign) {
                    isValid = false;
                    break;
                }
                players.push({ name: name, ign: ign });
            }

            if (!squadName || !isValid) {
                alert('Please fill in Squad Name and ALL 4 Player details.');
                return;
            }

            database.ref('esports/matches/' + matchId).once('value').then(matchSnap => {
                const matchData = matchSnap.val();
                const entryFee = parseFloat(matchData.entryFee) || 0;

                database.ref('users/' + appState.userId).once('value').then(userSnap => {
                    const userData = userSnap.val() || {};
                    const currentBalance = parseFloat(userData.balance) || 0;

                    if (currentBalance < entryFee) {
                        alert(`Insufficient Balance! You need ৳${entryFee} but have ৳${currentBalance}`);
                        return;
                    }

                    const newBalance = currentBalance - entryFee;
let currentWinning = parseFloat(userData.winningBalance) || 0;

let userUpdates = {
    balance: newBalance
};

// --- 🚨 FIXED LOGIC: Adjust Winning Balance ---
if (currentWinning > newBalance) {
    userUpdates.winningBalance = newBalance;
}

database.ref('users/' + appState.userId).update(userUpdates);

if (entryFee > 0) {
    database.ref('transactions').push({
        userId: appState.userId,
        type: 'match_entry',
        amount: entryFee,
        date: Date.now(),
        status: 'success',
        method: 'Esports Entry',
        matchId: matchId,
        title: `Entry Fee: ${matchData.title}`
    });
}


                    const registrationData = {
                        squadName: squadName,
                        leaderName: appState.currentUser.firstName,
                        userId: appState.userId,
                        timestamp: Date.now(),
                        players: players,
                        stats: { matches: 0, wins: 0, kills: 0, total: 0 } // Initialize stats
                    };

                    database.ref(`esports/registrations/${matchId}`).push(registrationData)
                        .then(() => {
                            alert('Squad Registration Successful! Entry Fee Deducted.');
                            esportsJoinModal.classList.remove('active');
                            checkEsportsRegistrations(); 
                            loadWallet();
                        })
                        .catch(error => {
                            console.error("Error registering:", error);
                            alert('Registration Failed. Please try again.');
                        });

                });
            });
        }

        function openEsportsParticipantsModal(matchId) {
            participantsListContent.innerHTML = '<div style="text-align:center; padding:20px;">Loading Squads...</div>';
            participantsModal.classList.add('active');

            database.ref(`esports/registrations/${matchId}`).once('value').then(snapshot => {
                const registrations = snapshot.val() || {};
                participantsListContent.innerHTML = '';

                if (Object.keys(registrations).length === 0) {
                    participantsListContent.innerHTML = `
                        <div class="no-data" style="padding: 20px;">
                            <i class="fas fa-users" style="font-size:32px;"></i>
                            <p>No squads joined yet</p>
                        </div>`;
                } else {
                    let serial = 1;
                    Object.values(registrations).forEach(reg => {
                        const item = document.createElement('div');
                        item.className = 'participant-item';
                        item.style.flexDirection = 'column'; 
                        item.style.alignItems = 'flex-start';
                        
                        let playersListHTML = '';
                        if(Array.isArray(reg.players)) {
                            playersListHTML = reg.players.map(p => `• ${p.name} [${p.ign}]`).join('<br>');
                        }

                        item.innerHTML = `
                            <div style="display:flex; width:100%; align-items:center; margin-bottom:5px;">
                                <div class="participant-serial">${serial++}</div>
                                <div class="participant-name" style="color:var(--primary); font-size:15px;">${reg.squadName}</div>
                            </div>
                            <div style="padding-left:42px; font-size:12px; color:var(--gray); width:100%;">
                                ${playersListHTML}
                            </div>
                        `;
                        participantsListContent.appendChild(item);
                    });
                }
            });
        }

        function showEsportsRoom(matchId) {
            if (!appState.esportsData.registrations[matchId]) {
                alert('You must register for this match to see room details!');
                return;
            }

            const match = appState.esportsData.matches.find(m => m.id === matchId);
            
            if(match) {
                const idDisplay = document.getElementById('roomIdDisplay');
                const passDisplay = document.getElementById('roomPasswordDisplay');
                const copyId = document.getElementById('copyRoomIdBtn');
                const copyPass = document.getElementById('copyRoomPassBtn');

                if(match.roomId && match.roomId.trim() !== "") {
                    idDisplay.textContent = match.roomId;
                    copyId.setAttribute('data-text', match.roomId);
                    copyId.style.display = 'inline-block';
                } else {
                    idDisplay.textContent = "Waiting for Admin...";
                    copyId.style.display = 'none';
                }

                if(match.roomPassword && match.roomPassword.trim() !== "") {
                    passDisplay.textContent = match.roomPassword;
                    copyPass.setAttribute('data-text', match.roomPassword);
                    copyPass.style.display = 'inline-block';
                } else {
                    passDisplay.textContent = "Waiting for Admin...";
                    copyPass.style.display = 'none';
                }

                roomInfoModal.classList.add('active');
            }
        }

        function loadMyMatches() {
    const container = document.getElementById('myMatchesContainer');
    
    if (!appState.myMatches || appState.myMatches.length === 0) {
        container.innerHTML = `
            <div class="no-data" id="noMyMatches" style="background: var(--card-light); border-radius: 16px; padding: 50px 20px; border: 1px dashed #cbd5e1;">
                <div style="width: 70px; height: 70px; background: rgba(59, 130, 246, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                    <i class="fas fa-ghost" style="font-size: 35px; color: var(--primary);"></i>
                </div>
                <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 8px; color: var(--text-light);">No Matches Yet</h3>
                <p style="font-size: 13px; color: var(--gray); margin-bottom: 25px;">You haven't registered for any battles. Ready to drop in?</p>
                <button class="join-btn" onclick="switchSection('play')" style="padding: 10px 25px;">
                    <i class="fas fa-play"></i> Join a Match
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    appState.myMatches.forEach(userMatch => {
        const match = appState.matches.find(m => m.id === userMatch.matchId);
        if (!match) return;
        
        const card = document.createElement('div');
        
        let statusClass = match.status === 'playing' ? 'live' : 'upcoming';
        let statusText = match.status === 'playing' ? 'Live Now' : 'Upcoming';
        if(match.status === 'ended') { statusClass = 'ended'; statusText = 'Ended'; }

        card.className = `my-match-card-modern ${statusClass}`;

        // Date & Time Format
        const matchDate = new Date(match.startTime);
        const dateStr = matchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const timeStr = matchDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

        // Room Details / Secret Section Logic (Compact)
        let secretSectionHTML = '';
        if (match.roomId && match.roomPassword) {
            secretSectionHTML = `
                <div class="mm-room-details">
                    <div class="mm-room-box">
                        <div>
                            <span style="font-size:9px; color:var(--gray); display:block; line-height:1; margin-bottom:2px;">Room ID</span>
                            <span>${match.roomId}</span>
                        </div>
                        <button class="copy-btn" data-text="${match.roomId}"><i class="fas fa-copy"></i></button>
                    </div>
                    <div class="mm-room-box">
                        <div>
                            <span style="font-size:9px; color:var(--gray); display:block; line-height:1; margin-bottom:2px;">Password</span>
                            <span>${match.roomPassword}</span>
                        </div>
                        <button class="copy-btn" data-text="${match.roomPassword}"><i class="fas fa-copy"></i></button>
                    </div>
                </div>
            `;
        } else {
            secretSectionHTML = `
                <div class="mm-locked">
                    <i class="fas fa-lock" style="margin-right: 4px;"></i> Room ID & Pass will be given here before match starts.
                </div>
            `;
        }

        // WhatsApp Share Text
        const waText = encodeURIComponent(`🎮 Match: ${match.title}\n⏰ Time: ${timeStr}, ${dateStr}\n👥 Squad: ${userMatch.playerNames.join(', ')}\n\nBe ready!`);

        card.innerHTML = `
            <div class="mm-header">
                <div>
                    <div class="mm-game-name"><i class="fas fa-gamepad"></i> ${match.category ? match.category : 'BATTLE ROYALE'}</div>
                    <div class="mm-title">${match.title}</div>
                </div>
                <div class="mm-status ${statusClass}">${statusText}</div>
            </div>
            
            <div class="mm-info-grid">
                <div class="mm-info-item">
                    <span class="mm-info-label"><i class="far fa-clock"></i> Schedule</span>
                    <span class="mm-info-value">${timeStr}, ${dateStr}</span>
                </div>
                <div class="mm-info-item">
                    <span class="mm-info-label"><i class="fas fa-users"></i> Squad (${userMatch.joinType})</span>
                    <span class="mm-info-value">${userMatch.playerNames.join(', ')}</span>
                </div>
            </div>
            
            ${secretSectionHTML}
            
            <div class="mm-actions">
                <a href="https://wa.me/?text=${waText}" target="_blank" class="mm-btn mm-btn-share" style="text-decoration:none;">
                    <i class="fab fa-whatsapp"></i> Share
                </a>
                <button class="mm-btn mm-btn-view" onclick='openParticipantsModal(${JSON.stringify(match).replace(/"/g, "&quot;")})'>
                    <i class="fas fa-list"></i> Participants
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
}


       
         // আপনার বর্তমান JS কোড (যা ঠিক আছে):
function loadResults() {
    if (!appState.matches) return;

    // ১. শুধুমাত্র 'ended' স্ট্যাটাসের ম্যাচগুলো ফিল্টার করা হচ্ছে
    const endedMatches = appState.matches.filter(m => m.status === 'ended');
    
    // ২. সর্ট করা হচ্ছে (নতুন শেষ হওয়া ম্যাচ আগে দেখাবে)
    endedMatches.sort((a, b) => b.startTime - a.startTime);

    appState.results = endedMatches;
    renderResults();
}


function renderResults() {
    const container = document.getElementById('resultsContainer');
    
    // ১. যদি কোনো রেজাল্ট না থাকে
    if (!appState.results || appState.results.length === 0) {
        container.innerHTML = `
            <div class="rc-no-data">
                <i class="fas fa-trophy"></i>
                <h3>No Results Yet</h3>
                <p style="font-size: 13px; color: var(--gray); font-weight: 500;">Finished matches will appear here.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    // ২. প্রতিটি রেজাল্ট এর জন্য প্রিমিয়াম কার্ড তৈরি
    appState.results.forEach(match => {
        // তারিখ এবং সময় ফরম্যাট
        const dateObj = new Date(match.startTime);
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

        const card = document.createElement('div');
        card.className = 'result-card-pro';
        
        card.innerHTML = `
            <div class="rc-header">
                <div class="rc-title-box">
                    <h3>${match.title}</h3>
                    <div class="rc-time"><i class="far fa-calendar-check"></i> ${dateStr} • ${timeStr}</div>
                </div>
                <div class="rc-status-badge">
                    <i class="fas fa-check-circle"></i> Finished
                </div>
            </div>
            
            <div class="rc-body">
                <div class="rc-stat">
                    <div class="rc-stat-label">Match Type</div>
                    <div class="rc-stat-val">${match.type}</div>
                </div>
                <div class="rc-stat">
                    <div class="rc-stat-label">Prize Pool</div>
                    <div class="rc-stat-val prize">৳${match.prizePool}</div>
                </div>
                <div class="rc-stat">
                    <div class="rc-stat-label">Per Kill</div>
                    <div class="rc-stat-val">৳${match.perKill || 0}</div>
                </div>
            </div>
            
            <div class="rc-footer">
                <div style="font-size: 11px; color: var(--gray); font-weight: 700; text-transform: uppercase;">
                    <i class="fas fa-map-marker-alt"></i> Category: ${match.category ? match.category : 'N/A'}
                </div>
                <div style="display:flex; gap:8px;">
                    <button class="rc-btn" style="background:var(--primary);" onclick="openMatchScoreboardModal('${match.id}')">
                        <i class="fas fa-list-ol"></i> Winners
                    </button>
                    <button class="rc-btn" onclick="openPrizePoolModalById('${match.id}')">
    <i class="fas fa-gift"></i> Prizes
</button>

                </div>
            </div>
        `;
        container.appendChild(card);
    });
}


// --- Default Ranks ---
const defaultRanks = [
    { name: "Bronze I", exp: 0, reward: 0, color: "#cd7f32", icon: "fa-medal" },
    { name: "Bronze II", exp: 50, reward: 0, color: "#cd7f32", icon: "fa-medal" },
    { name: "Bronze III", exp: 100, reward: 0, color: "#cd7f32", icon: "fa-medal" },
    { name: "Silver I", exp: 150, reward: 5, color: "#94a3b8", icon: "fa-medal" },
    { name: "Silver II", exp: 250, reward: 5, color: "#94a3b8", icon: "fa-medal" },
    { name: "Silver III", exp: 350, reward: 5, color: "#94a3b8", icon: "fa-medal" },
    { name: "Gold I", exp: 500, reward: 10, color: "#fbbf24", icon: "fa-trophy" },
    { name: "Gold II", exp: 700, reward: 10, color: "#fbbf24", icon: "fa-trophy" },
    { name: "Gold III", exp: 900, reward: 10, color: "#fbbf24", icon: "fa-trophy" },
    { name: "Platinum I", exp: 1200, reward: 20, color: "#0ea5e9", icon: "fa-gem" },
    { name: "Platinum II", exp: 1500, reward: 20, color: "#0ea5e9", icon: "fa-gem" },
    { name: "Platinum III", exp: 1800, reward: 20, color: "#0ea5e9", icon: "fa-gem" },
    { name: "Diamond I", exp: 2200, reward: 50, color: "#8b5cf6", icon: "fa-gem" },
    { name: "Diamond II", exp: 2600, reward: 50, color: "#8b5cf6", icon: "fa-gem" },
    { name: "Diamond III", exp: 3000, reward: 50, color: "#8b5cf6", icon: "fa-gem" },
    { name: "Master", exp: 4000, reward: 100, color: "#ef4444", icon: "fa-crown" },
    { name: "Grandmaster", exp: 6000, reward: 200, color: "#dc2626", icon: "fa-crown" }
];

let dynamicRanksConfig = defaultRanks;

// Firebase থেকে ডাটা আনার সময় Object কে Array তে কনভার্ট করার সেফটি লজিক
database.ref('settings/ranks').on('value', snap => {
    if(snap.exists()) {
        const data = snap.val();
        // Firebase object দিলে সেটাকে Array তে কনভার্ট করে নিবে
        dynamicRanksConfig = Array.isArray(data) ? data : Object.values(data);
    } else {
        dynamicRanksConfig = defaultRanks;
    }
    loadUserProfile(); 
});

// Rank ক্যালকুলেশন ফিক্স (Number conversion)
function getRankInfo(exp) {
    exp = Number(exp) || 0; // String থাকলেও Number করে নিবে
    
    // সেফটি ফলব্যাক
    if(!dynamicRanksConfig || dynamicRanksConfig.length === 0) {
        dynamicRanksConfig = defaultRanks;
    }

    let currentRank = dynamicRanksConfig[0];
    let nextRank = dynamicRanksConfig[1] || currentRank;
    let isMax = false;

    for (let i = 0; i < dynamicRanksConfig.length; i++) {
        // ডাটাবেস থেকে আসা EXP কে Number এ কনভার্ট করে তুলনা করা
        if (exp >= Number(dynamicRanksConfig[i].exp)) {
            currentRank = dynamicRanksConfig[i];
            nextRank = dynamicRanksConfig[i + 1] || dynamicRanksConfig[i];
        } else {
            break; // যখনই ইউজারের exp পরবর্তী র‍্যাংক থেকে ছোট হবে, লুপ থেমে যাবে
        }
    }

    // ম্যাক্স র‍্যাংক কিনা চেক করা
    if (currentRank.name === dynamicRanksConfig[dynamicRanksConfig.length - 1].name) {
        isMax = true;
    }

    return {
        name: currentRank.name,
        color: currentRank.color || "#cd7f32",
        icon: currentRank.icon || "fa-medal",
        next: isMax ? Number(currentRank.exp) : Number(nextRank.exp),
        prev: Number(currentRank.exp),
        isMax: isMax
    };
}

        
        function loadUserProfile() {
    if (!appState.userId) return;
    
    // Firebase থেকে ইউজারের ডাটা রিয়েল-টাইমে শোনা হচ্ছে
    database.ref('users/' + appState.userId).on('value', snap => {
        const user = snap.val() || {};
        
        // ১. মেইন ব্যালেন্স আপডেট
        appState.walletBalance = parseFloat(user.balance) || 0;
        const mainBalanceEl = document.getElementById('walletBalance');
        if(mainBalanceEl) {
            mainBalanceEl.textContent = `৳${appState.walletBalance.toFixed(2)}`;
        }
        
        // ২. উইনিং ব্যালেন্স আপডেট (স্টেট + UI) -- এই অংশটি মিসিং ছিল
        if(!appState.currentUser) appState.currentUser = {}; 
        appState.currentUser.winningBalance = parseFloat(user.winningBalance) || 0;

        // Withdraw সেকশনের ব্যালেন্স টেক্সট আপডেট করা
        const winningBalanceEl = document.getElementById('cardWinningBalance');
        if (winningBalanceEl) {
            winningBalanceEl.textContent = appState.currentUser.winningBalance.toFixed(2);
        }
        
      // ৩. স্ট্যাটস আপডেট (Matches, Kills, Wins, Coins)
if(document.getElementById('statMatches')) document.getElementById('statMatches').textContent = user.matchesPlayed || 0;
if(document.getElementById('statKills')) document.getElementById('statKills').textContent = user.totalKills || 0;
if(document.getElementById('statWins')) document.getElementById('statWins').textContent = user.totalWins || 0;

// এই লাইনটি মিসিং ছিল, এটি যোগ করুন:
if(document.getElementById('statCoins')) document.getElementById('statCoins').textContent = user.coins || 0;

        
                    // --- NEW: EXP & Rank System ---
        const userExp = user.exp || 0;
        const rank = getRankInfo(userExp);
        
        if(document.getElementById('profileRankName')) {
            document.getElementById('profileRankName').textContent = rank.name;
            document.getElementById('profileRankName').style.color = rank.color;
        }
        if(document.getElementById('profileRankIcon')) {
            document.getElementById('profileRankIcon').className = `fas ${rank.icon}`;
        }
        if(document.getElementById('profileRankIconBox')) {
            document.getElementById('profileRankIconBox').style.background = rank.color;
        }
        
        if (rank.isMax) {
            if(document.getElementById('profileExpText')) document.getElementById('profileExpText').textContent = `MAX EXP: ${userExp}`;
            if(document.getElementById('rankProgressBar')) {
                document.getElementById('rankProgressBar').style.width = '100%';
                document.getElementById('rankProgressBar').style.background = rank.color;
            }
        } else {
            if(document.getElementById('profileExpText')) document.getElementById('profileExpText').textContent = `EXP: ${userExp} / ${rank.next}`;
            if(document.getElementById('rankProgressBar')) {
                // প্রোগ্রেস ক্যালকুলেট করা এবং সেফটি চেক দেওয়া
                let progress = ((userExp - rank.prev) / (rank.next - rank.prev)) * 100;
                progress = Math.max(0, Math.min(100, progress)); // 0 থেকে 100 এর মধ্যে সীমাবদ্ধ রাখা
                
                document.getElementById('rankProgressBar').style.width = `${progress}%`;
                document.getElementById('rankProgressBar').style.background = `linear-gradient(90deg, ${rank.color}, #f59e0b)`;
            }
        }
       
        const totalRefEl = document.getElementById('totalReferralsCount');
        if(totalRefEl) {
            totalRefEl.textContent = user.referrals || 0;
        }
        
    });
}


        
        
  // রিয়েল-টাইম টাস্ক রেন্ডারিং (Fixed)
window.loadTasks = function() {
    const container = document.querySelector('.task-list-container');
    if(!container) return;
    
    // ডাটা আসার আগে লোডিং এনিমেশন দেখাবে
    container.innerHTML = '<div style="text-align:center; padding:60px 20px; color:var(--primary);"><i class="fas fa-spinner fa-spin" style="font-size:35px;"></i><p style="margin-top:15px; color:var(--gray); font-weight:600;">Loading Daily Missions...</p></div>';
    
    database.ref('tasks').once('value').then((snapshot) => {
        const data = snapshot.val();
        container.innerHTML = '';
        
        if (!data || Object.keys(data).length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:50px 20px; color:var(--gray);"><i class="fas fa-tasks" style="font-size:45px; margin-bottom:15px; opacity:0.3;"></i><br><p style="font-weight:600;">No tasks available right now.</p></div>';
            return;
        }

        Object.keys(data).forEach(key => {
            const t = data[key];
            
            // যদি টাস্ক অ্যাডমিন পজ করে রাখে, তবে ইউজারকে দেখাবে না
            if (t.isActive === false) return; 

            const claimed = t.claimedBy && t.claimedBy[appState.userId];
            const isFull = t.maxLimit > 0 && (t.claimsCount || 0) >= t.maxLimit;
            const isExpired = t.expiryTime > 0 && Date.now() > t.expiryTime;

            let status = 'pending';
            let btnHtml = '';
            let progressHtml = '';
            let cardClasses = 'modern-task-card';

            if(claimed) {
                status = 'completed';
                cardClasses += ' completed';
                btnHtml = `<button class="task-btn-modern done-btn" disabled><i class="fas fa-check-double"></i> Done</button>`;
                progressHtml = `<span class="tp-text" style="color:#10b981;">Completed</span>`;
            } else if(isExpired) {
                status = 'expired';
                cardClasses += ' completed';
                btnHtml = `<button class="task-btn-modern done-btn" disabled><i class="fas fa-clock"></i> Expired</button>`;
                progressHtml = `<span class="tp-text" style="color:#ef4444;">Time is up!</span>`;
            } else if(isFull) {
                status = 'full';
                cardClasses += ' completed';
                btnHtml = `<button class="task-btn-modern done-btn" disabled><i class="fas fa-times-circle"></i> Full</button>`;
                progressHtml = `<span class="tp-text" style="color:#f59e0b;">Limit Reached</span>`;
            } else {
                status = 'pending';
                cardClasses += ' ready';
                let progressPct = t.maxLimit > 0 ? ((t.claimsCount||0) / t.maxLimit) * 100 : 0;
                let progText = t.maxLimit > 0 ? `${t.claimsCount||0}/${t.maxLimit}` : 'Unlimited';
                
                progressHtml = `
                    <div class="tp-bar"><div class="tp-fill" style="width: ${progressPct}%;"></div></div>
                    <span class="tp-text">${progText}</span>`;
                
                btnHtml = `
                    <button class="task-btn-modern go-btn" id="goBtn_${key}" onclick="clickTask('${key}', '${t.link}')">Start</button>
                    <button class="task-btn-modern claim-btn" id="claimBtn_${key}" style="display:none;" onclick="claimRealTask('${key}', ${t.reward})">Claim</button>
                `;
            }

            container.innerHTML += `
                <div class="${cardClasses}" data-status="${status}">
                    <div class="task-icon bg-blue" style="overflow:hidden; background:transparent;">
                        <img src="${t.image}" onerror="this.src='https://placehold.co/100x100/3b82f6/FFF?text=T'" style="width:100%; height:100%; object-fit:cover; border-radius:14px;">
                    </div>
                    <div class="task-details">
                        <h4>${t.title}</h4>
                        <div class="task-progress">${progressHtml}</div>
                    </div>
                    <div class="task-action">
                        <div class="task-reward">+${t.reward} <i class="fas fa-coins"></i></div>
                        ${btnHtml}
                    </div>
                </div>
            `;
        });
    }).catch(err => {
        console.error(err);
        container.innerHTML = '<div style="text-align:center; padding:20px; color:var(--danger);">Failed to load tasks from server.</div>';
    });
}

// কয়েন ক্লেইম করার রিয়েল ও অ্যান্টি-চিট লজিক
window.claimRealTask = async function(taskId, reward) {
    const btn = document.getElementById(`claimBtn_${taskId}`);
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verify...';
    btn.disabled = true;

    try {
        const snap = await database.ref(`tasks/${taskId}`).once('value');
        const t = snap.val();
        
        if(!t) throw new Error("Task no longer exists!");
        if(t.isActive === false) throw new Error("Task is currently paused!");
        if(t.claimedBy && t.claimedBy[appState.userId]) throw new Error("Already claimed!");
        if(t.expiryTime > 0 && Date.now() > t.expiryTime) throw new Error("Task expired!");
        if(t.maxLimit > 0 && (t.claimsCount || 0) >= t.maxLimit) throw new Error("Task limit reached!");

        // 🚨 TELEGRAM VERIFICATION LOGIC 🚨
        if (t.requireTgCheck && t.tgChannel) {
            const tokenSnap = await database.ref('settings/botToken').once('value');
            const botToken = tokenSnap.val();

            if (!botToken) throw new Error("Verification system error (Bot Token missing).");

            // টেলিগ্রাম API কল করে চেক করা ইউজার চ্যানেলে আছে কিনা
            const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${t.tgChannel}&user_id=${appState.userId}`);
            const tgData = await tgRes.json();

            if (!tgData.ok) {
                console.error("TG API Error:", tgData);
                throw new Error("Could not verify. Make sure you joined the exact channel and try again.");
            }

            const status = tgData.result.status;
            // যদি ইউজার লেফট নেয় বা কিক খায়
            if (status === 'left' || status === 'kicked' || status === 'restricted') {
                throw new Error("Verification Failed! You haven't joined the channel yet. Please join first.");
            }
            // ভেরিফিকেশন সফল!
        }

        // সফল হলে ডাটাবেস আপডেট
        let updates = {};
        updates[`tasks/${taskId}/claimsCount`] = (t.claimsCount || 0) + 1;
        updates[`tasks/${taskId}/claimedBy/${appState.userId}`] = true;
        
        const uSnap = await database.ref(`users/${appState.userId}`).once('value');
        const user = uSnap.val() || {};
        updates[`users/${appState.userId}/coins`] = (parseInt(user.coins) || 0) + parseInt(reward);
            
        await database.ref().update(updates);

        if(window.Telegram && window.Telegram.WebApp.HapticFeedback) {
             window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
        
        alert(`Success! Verification Passed. +${reward} Coins added!`);

    } catch (err) {
        alert(err.message);
        btn.innerHTML = 'Claim';
        btn.disabled = false;
    }
}

// লিংকে ক্লিক করলে ডাটাবেসে Clicks আপডেট হবে এবং Claim বাটন শো করবে
window.clickTask = function(taskId, link) {
    // ডাটাবেসে ক্লিক কাউন্ট বাড়ানো
    database.ref(`tasks/${taskId}/clicksCount`).transaction(count => (count || 0) + 1);
    
    window.open(link, '_blank'); // লিংক ওপেন হবে
    
    // বাটন সুইচ করা (Start থেকে Claim)
    document.getElementById(`goBtn_${taskId}`).style.display = 'none';
    document.getElementById(`claimBtn_${taskId}`).style.display = 'inline-block';
}




      function updateProfileDisplay() {
    if (!appState.currentUser) return;
    
    document.getElementById('profileName').textContent = `${appState.currentUser.firstName} ${appState.currentUser.lastName || ''}`.trim();
    document.getElementById('profileUsername').textContent = `@${appState.currentUser.username}`;

    const avatarContainer = document.getElementById('profileAvatarContainer');
    
    // ❌ আগের কোডে এই ID গুলো ছিল না, তাই র্যাংক আপডেট ক্র্যাশ করতো। এখন ঠিক করা হয়েছে।
    const badgeHTML = '<div class="min-rank-badge" id="profileRankIconBox"><i class="fas fa-medal" id="profileRankIcon"></i></div>';
    
    if (appState.currentUser.photoUrl && appState.currentUser.photoUrl !== 'undefined') {
        avatarContainer.innerHTML = `<img src="${appState.currentUser.photoUrl}" class="min-avatar-img" alt="Profile">${badgeHTML}`;
    } else {
        avatarContainer.innerHTML = `<i class="fas fa-user-circle" style="font-size: 100px; color: #cbd5e1;"></i>${badgeHTML}`;
    }
}


        function loadWallet() {
        }

        // 1. ট্যাব পরিবর্তন করার ফাংশন (নতুন)
function switchHistoryTab(tabName) {
    currentHistoryTab = tabName;
    
    const tabs = document.querySelectorAll('.p-hist-tab');
    tabs.forEach(tab => {
        if(tab.getAttribute('onclick').includes(tabName)) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    loadTransactions();
}

function loadTransactions() {
    const container = document.getElementById('historyListContent');
    const summaryCount = document.getElementById('txnTotalCount');
    
    container.innerHTML = '<div style="text-align:center; padding:50px 20px;"><i class="fas fa-spinner fa-spin" style="font-size:40px; color:var(--primary);"></i><p style="margin-top:15px; color:var(--gray); font-weight:700; font-size:14px;">Fetching your records...</p></div>';

    database.ref('transactions').orderByChild('userId').equalTo(appState.userId).once('value').then(snap => {
        const data = snap.val();
        container.innerHTML = '';

        if(!data) {
            showNoHistory(container);
            if(summaryCount) summaryCount.textContent = '0';
            return;
        }

        const transactions = Object.values(data).reverse();
        
        const filteredList = transactions.filter(txn => {
            if (currentHistoryTab === 'deposit') {
                return txn.type === 'deposit' && 
                       txn.method !== 'Redeem Code' && 
                       txn.method !== 'Referral Bonus' && 
                       txn.method !== 'Lucky Draw Winner';
            } else if (currentHistoryTab === 'match_entry') {
                return txn.type === 'match_entry';
            } else if (currentHistoryTab === 'withdraw') {
                return txn.type === 'withdraw';
            }
            return false;
        });

        if(summaryCount) summaryCount.textContent = filteredList.length;

        if(filteredList.length === 0) {
            showNoHistory(container);
            return;
        }
    
        filteredList.forEach(txn => {
            const txnItem = document.createElement('div');
            
            let iconStyle = '';
            let amountSign = '';
            let iconHtml = '';
            let amountColor = '';
            let typeClass = '';

            // --- Dynamic Gradient Icons & Styling ---
            if (txn.type === 'deposit') {
                typeClass = 'type-deposit';
                amountSign = '+';
                amountColor = '#10b981';
                if (txn.method === 'Redeem Code') {
                    iconStyle = 'background: linear-gradient(135deg, #8b5cf6, #6d28d9);';
                    iconHtml = '<i class="fas fa-gift"></i>';
                } else if (txn.method === 'Lucky Draw Winner') {
                    iconStyle = 'background: linear-gradient(135deg, #f59e0b, #d97706);';
                    iconHtml = '<i class="fas fa-trophy"></i>';
                } else if (txn.method === 'Referral Bonus') {
                    iconStyle = 'background: linear-gradient(135deg, #0ea5e9, #0284c7);';
                    iconHtml = '<i class="fas fa-users"></i>';
                } else {
                    iconStyle = 'background: linear-gradient(135deg, #10b981, #047857);';
                    iconHtml = '<i class="fas fa-level-down-alt"></i>';
                }
            } else if (txn.type === 'withdraw') {
                typeClass = 'type-withdraw';
                amountSign = '-';
                amountColor = '#ef4444';
                iconStyle = 'background: linear-gradient(135deg, #ef4444, #b91c1c);';
                iconHtml = '<i class="fas fa-level-up-alt"></i>';
            } else if (txn.type === 'match_entry') {
                typeClass = 'type-entry';
                amountSign = '-';
                amountColor = 'var(--text-light)';
                if (txn.method === 'Lucky Draw Ticket') {
                    iconStyle = 'background: linear-gradient(135deg, #ec4899, #be185d);';
                    iconHtml = '<i class="fas fa-ticket-alt"></i>';
                } else {
                    iconStyle = 'background: linear-gradient(135deg, #3b82f6, #1d4ed8);';
                    iconHtml = '<i class="fas fa-gamepad"></i>';
                }
            }
            
            txnItem.className = `txn-card-pro ${typeClass}`;

                       // --- Status Badges ---
            let statusClass = '';
            let statusText = txn.status.toUpperCase();
            let statusIcon = ''; // নতুন আইকন ভ্যারিয়েবল
            
            if (txn.status === 'pending' || txn.status === 'processing') {
                statusClass = 'status-pending-pro';
                statusIcon = '<i class="fas fa-clock"></i>';
            } else if (txn.status === 'success') {
                statusClass = 'status-success-pro';
                statusIcon = '<i class="fas fa-check-circle"></i>';
            } else if (txn.status === 'cancelled') {
                statusClass = 'status-cancelled-pro';
                statusIcon = '<i class="fas fa-times-circle"></i>';
            }

            // Date format processing
            const d = new Date(txn.date);
            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

            txnItem.innerHTML = `
                <div class="txn-left-pro">
                    <div class="txn-icon-pro" style="${iconStyle}">
                        ${iconHtml}
                    </div>
                    <div class="txn-info-pro">
                        <div class="txn-title-pro">${txn.title || txn.type.toUpperCase()}</div>
                        <div class="txn-date-pro"><i class="far fa-clock"></i> ${dateStr}, ${timeStr}</div>
                    </div>
                </div>
                                <div class="txn-right-pro">
                    <div class="txn-amount-pro" style="color: ${amountColor};">${amountSign}৳${parseFloat(txn.amount).toFixed(2)}</div>
                    <div class="txn-status-badge ${statusClass}">${statusIcon} ${statusText}</div>
                </div>

            `;
            
            // Fix text color for dark mode "match_entry"
            if (txn.type === 'match_entry' && document.body.classList.contains('dark-mode')) {
                txnItem.querySelector('.txn-amount-pro').style.color = 'var(--text-dark)';
            }
            
            container.appendChild(txnItem);
        });
    });
}

function showNoHistory(container) {
    let msg = 'No records found in this section.';
    if(currentHistoryTab === 'deposit') msg = 'You haven\'t made any deposits yet.';
    if(currentHistoryTab === 'match_entry') msg = 'You haven\'t played any matches yet.';
    if(currentHistoryTab === 'withdraw') msg = 'You haven\'t made any withdrawals yet.';

    container.innerHTML = `
        <div style="text-align:center; padding: 60px 20px; background: var(--card-light); border-radius: 20px; border: 1px dashed #cbd5e1; margin-top: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.02);">
            <div style="width: 80px; height: 80px; background: rgba(148, 163, 184, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                <i class="fas fa-file-invoice" style="font-size: 35px; color: var(--gray);"></i>
            </div>
            <h3 style="font-size: 18px; font-weight: 800; color: var(--text-light); margin-bottom: 8px;">No Data Available</h3>
            <p style="font-size: 13px; color: var(--gray); font-weight: 500;">${msg}</p>
        </div>
    `;
    
    // Dark mode check for the empty state
    if(document.body.classList.contains('dark-mode')){
        container.querySelectorAll('[style*="var(--card-light)"]').forEach(el => el.style.background = 'var(--card-dark)');
        container.querySelectorAll('[style*="color: var(--text-light)"]').forEach(el => el.style.color = 'var(--text-dark)');
    }
}

        
// 1. Redeem History লোড করার ফাংশন
function loadRedeemHistory() {
    const container = document.getElementById('redeemHistoryList');
    container.innerHTML = '<div style="text-align:center; padding:10px; font-size:12px;">Loading...</div>';

    database.ref('transactions').orderByChild('userId').equalTo(appState.userId).once('value').then(snap => {
        const data = snap.val();
        container.innerHTML = '';
        
        if(!data) {
            container.innerHTML = '<div style="text-align:center; padding:10px; color:var(--gray); font-size:12px;">No code redeemed yet</div>';
            return;
        }

        // শুধুমাত্র 'Redeem Code' মেথডগুলো ফিল্টার করা হচ্ছে
        const redemptions = Object.values(data)
            .filter(t => t.method === 'Redeem Code')
            .reverse();

        if (redemptions.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:10px; color:var(--gray); font-size:12px;">No code redeemed yet</div>';
            return;
        }

        redemptions.forEach(txn => {
            const div = document.createElement('div');
            div.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:10px; background:var(--light); margin-bottom:8px; border-radius:8px; border:1px solid #e5e7eb;';
            if(document.body.classList.contains('dark-mode')) {
                div.style.background = 'var(--card-dark)';
                div.style.borderColor = '#374151';
            }

            const date = new Date(txn.date).toLocaleDateString();
            
            div.innerHTML = `
                <div>
                    <div style="font-weight:600; font-size:13px; color:var(--primary);">${txn.title.replace('Redeemed: ', '')}</div>
                    <div style="font-size:11px; color:var(--gray);">${date}</div>
                </div>
                <div style="font-weight:700; color:var(--success); font-size:14px;">+৳${txn.amount}</div>
            `;
            container.appendChild(div);
        });
    });
}

redeemBtn.addEventListener('click', () => {
    redeemModal.classList.add('active');
    loadRedeemHistory(); // এই লাইনটি নতুন যোগ করা হয়েছে
});

        // ১. পেমেন্ট মেথড লোড করার ফাংশন
function loadDepositMethodsPage() {
    resetDepositPage();
    const container = document.getElementById('paymentMethodsList');
    
    // লোডিং স্টাইল আপডেট
    container.innerHTML = '<div style="padding:10px; color:var(--gray); font-size:12px;">Loading...</div>';
    
    database.ref('payment_settings/deposit').once('value').then(snapshot => {
        container.innerHTML = '';
        const methods = snapshot.val();
        
        if (!methods) {
            container.innerHTML = '<div class="no-data" style="margin:auto;">No methods found</div>';
            return;
        }

        Object.keys(methods).forEach(key => {
            const method = methods[key];
            
            // আইকন এবং কালার লজিক
            let icon = '<i class="fas fa-wallet pm-icon-row" style="color:var(--gray);"></i>';
            let color = 'var(--text-light)';
            const nameLower = method.name.toLowerCase();
            
            if(nameLower.includes('bkash')) { 
                color = '#e2136e'; 
                icon = '<i class="fas fa-money-bill-wave pm-icon-row" style="color:#e2136e;"></i>'; 
            }
            if(nameLower.includes('nagad')) { 
                color = '#ec1c24'; 
                icon = '<i class="fas fa-mobile-alt pm-icon-row" style="color:#ec1c24;"></i>'; 
            }
            if(nameLower.includes('rocket')) { 
                color = '#8c3494'; 
                icon = '<i class="fas fa-rocket pm-icon-row" style="color:#8c3494;"></i>'; 
            }

            const div = document.createElement('div');
            // এখানে নতুন ক্লাস ব্যবহার করা হয়েছে
            div.className = 'payment-method-card-row';
            
            div.innerHTML = `
                ${icon}
                <div style="font-weight:700; font-size:13px; color:${color}; text-align:center;">${method.name}</div>
                <div style="font-size:10px; color:var(--gray);">Min: ${method.minDeposit}</div>
            `;
            
            div.onclick = () => selectDepositMethodPage(method);
            container.appendChild(div);
        });
    });
}


// ২. মেথড সিলেক্ট করার ফাংশন
function selectDepositMethodPage(method) {
    // UI পরিবর্তন (Step 1 Hide, Step 2 Show)
    document.getElementById('depositStep1').style.display = 'none';
    document.getElementById('depositStep2').style.display = 'block';
    
    // ডাটা সেট করা
    document.getElementById('targetNumber').textContent = method.number;
    document.getElementById('minDepDisplay').textContent = method.minDeposit;
    document.getElementById('selectedMethodNamePage').value = method.name;
    
    // ইনপুট ক্লিয়ার করা
    document.getElementById('depositAmountPage').value = '';
    document.getElementById('depositTrxIDPage').value = '';
}

// ৩. রিসেট বা ব্যাক ফাংশন
function resetDepositPage() {
    document.getElementById('depositStep1').style.display = 'block';
    document.getElementById('depositStep2').style.display = 'none';
}

// ৪. সাবমিট ফাংশন (Auto-Deposit লজিক সহ)
function submitDepositPage() {
    const amount = parseFloat(document.getElementById('depositAmountPage').value);
    const trxId = document.getElementById('depositTrxIDPage').value.trim().toUpperCase();
    const method = document.getElementById('selectedMethodNamePage').value;
    const minAmount = parseFloat(document.getElementById('minDepDisplay').textContent);

    if (!amount || amount < minAmount) {
        alert(`Minimum deposit amount is ৳${minAmount}`);
        return;
    }
    if (trxId.length < 5) {
        alert("Please enter a valid Transaction ID");
        return;
    }

    const submitBtn = document.querySelector('#depositFormPage button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    // প্রথমে অ্যাডমিন প্যানেলের Auto-Deposit সেটিং চেক করা হচ্ছে
    database.ref('settings/autoDeposit').once('value').then(settingSnap => {
        const isAutoDepositEnabled = settingSnap.val() === true;

        // এরপর TrxID ডুপ্লিকেট চেক
        return database.ref('transactions').orderByChild('trxId').equalTo(trxId).once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                throw new Error("This TrxID has already been used!");
            }
            
            const newTxnKey = database.ref('transactions').push().key;
            
            // অটো-ডিপোজিট অন থাকলে 'processing' স্ট্যাটাস হবে (SMS forwarder এর জন্য), অফ থাকলে রেগুলার 'pending'
            const initialStatus = isAutoDepositEnabled ? 'processing' : 'pending';

            const transactionData = {
                userId: appState.userId,
                userName: appState.currentUser.firstName,
                type: 'deposit',
                amount: amount,
                method: method,
                trxId: trxId,
                date: Date.now(),
                status: initialStatus, 
                title: `Deposit: ${method}`
            };

            return database.ref(`transactions/${newTxnKey}`).set(transactionData).then(() => isAutoDepositEnabled);
        });
    })
    .then((isAutoDepositEnabled) => {
        if (isAutoDepositEnabled) {
            alert("Auto-Verification in progress!\nআপনার ট্রানজেকশনটি চেক করা হচ্ছে, কিছুক্ষণের মধ্যেই ব্যালেন্স অ্যাড হয়ে যাবে।");
        } else {
            alert("Request Submitted Successfully!\nঅ্যাডমিন চেক করে ব্যালেন্স অ্যাড করে দিবে।");
        }
        switchSection('profile');
        loadTransactions();
    })
    .catch(error => {
        alert(error.message);
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    });
}


                // --- WITHDRAWAL FUNCTIONS ---

// ১. মেথড লোড করার ফাংশন

// ১. মেথড লোড করার ফাংশন
function loadWithdrawMethodsPage() {
    document.getElementById('withdrawInputArea').style.display = 'none';
    document.getElementById('withdrawFormPage').reset();
    
    const winBal = appState.currentUser.winningBalance || 0;
    document.getElementById('cardWinningBalance').textContent = winBal.toFixed(2);

    const container = document.getElementById('withdrawMethodsGrid');
    container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 20px;"><i class="fas fa-spinner fa-spin" style="color:#9333ea; font-size:24px;"></i></div>';

    database.ref('settings/paymentLogos').once('value').then(logoSnap => {
        const logos = logoSnap.val() || {};

        database.ref('payment_settings/withdraw').once('value').then(snapshot => {
            container.innerHTML = '';
            const methods = snapshot.val();

            if (!methods) {
                container.innerHTML = '<div style="grid-column:1/-1; text-align:center; font-weight: 600; color: var(--gray);">No methods available</div>';
                return;
            }

            Object.keys(methods).forEach(key => {
                const method = methods[key];
                
                let logoUrl = logos.default || '';
                let color = 'var(--text-light)';
                const nameLower = method.name.toLowerCase();

                // Custom Colors based on network
                if(nameLower.includes('bkash')) { color = '#e2136e'; logoUrl = logos.bkash || logoUrl; }
                else if(nameLower.includes('nagad')) { color = '#ec1c24'; logoUrl = logos.nagad || logoUrl; }
                else if(nameLower.includes('rocket')) { color = '#8c3494'; logoUrl = logos.rocket || logoUrl; }
                else if(nameLower.includes('upay')) { color = '#2b75f1'; logoUrl = logos.upay || logoUrl; }

                let iconHtml = logoUrl 
                    ? `<img src="${logoUrl}" alt="${method.name}" style="width: 36px; height: 36px; object-fit: contain; margin-bottom: 2px;">`
                    : `<div style="width:36px; height:36px; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.05); border-radius:10px; margin-bottom:2px;"><i class="fas fa-wallet" style="font-size: 20px; color:${color};"></i></div>`;

                const div = document.createElement('div');
                div.className = 'method-card-clean'; // Clean & Fast class
                div.onclick = () => selectWithdrawMethodNew(method, div);

                div.innerHTML = `
                    ${iconHtml}
                    <div class="mcc-name">${method.name}</div>
                    <div class="mcc-limit">Min ৳${method.minWithdraw}</div>
                `;
                container.appendChild(div);
            });
        });
    });
}

// ২. মেথড সিলেক্ট করার ফাংশন
function selectWithdrawMethodNew(method, element) {
    // Hardware Haptic (No Lag)
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }

    // সব বক্স থেকে selected ক্লাস সরানো
    document.querySelectorAll('#withdrawMethodsGrid .method-card-clean').forEach(el => el.classList.remove('selected'));
    
    // ক্লিক করা বক্সে selected ক্লাস দেওয়া
    element.classList.add('selected');

    // ইনপুট এরিয়া দেখানো (No heavy animation, just opacity fade)
    const inputArea = document.getElementById('withdrawInputArea');
    inputArea.style.display = 'block';
    
    // ভ্যালু সেট করা
    document.getElementById('selectedWithMethodName').value = method.name;
    document.getElementById('minWithDisplay').textContent = method.minWithdraw;

    // হালকা স্ক্রল
    inputArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}




// ৩. রিসেট ফাংশন
function resetWithdrawPage() {
    document.getElementById('withdrawStep2').style.display = 'none';
    document.getElementById('withdrawFormPage').reset();
    document.querySelectorAll('.payment-method-card-row').forEach(el => el.classList.remove('selected'));
}

// ৪. ফর্ম সাবমিট ফাংশন

document.getElementById('withdrawFormPage').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('withdrawAmountPage').value);
    const number = document.getElementById('withdrawNumberPage').value.trim();
    const method = document.getElementById('selectedWithMethodName').value;
    const minAmount = parseFloat(document.getElementById('minWithDisplay').textContent);
    
    // Winning Balance চেক করা
    const winningBal = parseFloat(appState.currentUser.winningBalance) || 0;

    if (!amount || amount < minAmount) {
        alert(`Minimum withdrawal amount is ৳${minAmount}`);
        return;
    }
    
    // ১. মেইন ব্যালেন্স চেক
    if (appState.walletBalance < amount) {
        alert("Insufficient Main Balance!");
        return;
    }

    // ২. উইনিং ব্যালেন্স চেক (সবচেয়ে জরুরি)
    if (amount > winningBal) {
        alert(`You can only withdraw your Winning Balance!\nAvailable for Withdraw: ৳${winningBal}`);
        return;
    }

    if (number.length < 11) {
        alert("Please enter a valid phone number");
        return;
    }

    const submitBtn = document.querySelector('#withdrawFormPage button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    // ব্যালেন্স এবং উইনিং ব্যালেন্স আপডেট
    const newBalance = appState.walletBalance - amount;
    const newWinning = winningBal - amount; 
    
    const updates = {};
    const newTxnKey = database.ref('transactions').push().key;

    updates[`users/${appState.userId}/balance`] = newBalance;
    updates[`users/${appState.userId}/winningBalance`] = newWinning; // নতুন লাইন

    updates[`transactions/${newTxnKey}`] = {
        userId: appState.userId,
        userName: appState.currentUser.firstName,
        type: 'withdraw',
        amount: amount,
        method: method,
        number: number,
        date: Date.now(),
        status: 'pending',
        title: `Withdraw: ${method}`
    };

    database.ref().update(updates)
    .then(() => {
        alert("Withdrawal Request Submitted Successfully!");
        switchSection('profile'); 
        loadTransactions(); 
        loadUserProfile(); 
    })
    .catch(error => {
        alert("Error: " + error.message);
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    });
});

        
       
       // আগের copyToClipboard ফাংশনটি ডিলিট করে এটি বসান



function copyToClipboard(text) {
    if (!text) return;

    // Telegram Haptic Feedback
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }

    // Modern API (Android/Chrome)
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).catch(() => {
            fallbackCopyTextToClipboard(text);
        });
    } else {
        fallbackCopyTextToClipboard(text); // iOS / iPhone / Older Android
    }
}

// স্পেশাল ফলব্যাক (সব ডিভাইসে কাজ করার জন্য)
function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    
    // স্ক্রিন যেন লাফিয়ে না ওঠে তাই Fixed
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0"; // লুকানো থাকবে

    document.body.appendChild(textArea);
    
    // iOS Safari Fix (Textarea সিলেক্ট করা)
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, 99999);

    try {
        document.execCommand('copy');
    } catch (err) {
        console.error('Fallback Copy failed', err);
    }

    document.body.removeChild(textArea);
}
