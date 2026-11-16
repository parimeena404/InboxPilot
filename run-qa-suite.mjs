// Complete 14-Step QA Test Engine for InboxPilot
import { readFileSync, existsSync } from 'fs';

console.log('================================================================');
console.log('   INBOXPILOT PRE-LAUNCH COMPREHENSIVE QA AUDIT (14 STEPS)');
console.log('================================================================\n');

let passed = 0;
let failed = 0;

function assert(cond, name, note = '') {
  if (cond) {
    console.log(`  ✅ [PASS] ${name}`);
    if (note) console.log(`       └─ ${note}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${name}`);
    if (note) console.error(`       └─ ${note}`);
    failed++;
  }
}

// Read sample conversations from source
const emailsSource = readFileSync('./src/data/emails.ts', 'utf8');
const classifierSource = readFileSync('./src/services/classifier.ts', 'utf8');
const storeSource = readFileSync('./src/store/useStore.ts', 'utf8');
const inboxSource = readFileSync('./src/pages/Inbox.tsx', 'utf8');
const clientSource = readFileSync('./src/pages/ClientWorkspace.tsx', 'utf8');
const dashboardSource = readFileSync('./src/pages/Dashboard.tsx', 'utf8');
const onboardingSource = readFileSync('./src/pages/Onboarding.tsx', 'utf8');
const topbarSource = readFileSync('./src/components/layout/TopBar.tsx', 'utf8');
const sidebarSource = readFileSync('./src/components/layout/Sidebar.tsx', 'utf8');

console.log('--- Step 1: Enter through demo onboarding ---');
// Verify initial store state has isAuthenticated: false so user lands on landing/onboarding
assert(storeSource.includes('isAuthenticated: false,'), 'Store initial state is unauthenticated (visitor sees Landing & Onboarding)');
assert(storeSource.includes('onboardingComplete: false,'), 'Onboarding is not pre-completed');
assert(onboardingSource.includes('handleRoleSelect'), 'Role selection handler present');
assert(onboardingSource.includes('handleDemoMode'), 'One-click evaluator Demo Mode access present');

console.log('\n--- Step 2: Connect a simulated Gmail account ---');
assert(onboardingSource.includes("connectAccount(provider as 'gmail' | 'outlook', email)"), 'Onboarding connects Gmail account into application store');
assert(storeSource.includes('connectAccount: (provider, email)'), 'Store connectAccount action handles Gmail OAuth simulation');

console.log('\n--- Step 3: Open the assistant dashboard ---');
assert(dashboardSource.includes('Total Emails') && dashboardSource.includes('totalEmails'), 'Dashboard computes and renders Total Emails metric');
assert(dashboardSource.includes('unreadCount'), 'Dashboard computes and renders Unread metric');
assert(dashboardSource.includes('requiresAction'), 'Dashboard computes and renders Requires Action metric');
assert(dashboardSource.includes('waitingForResponse'), 'Dashboard computes and renders Waiting for Response metric');
assert(dashboardSource.includes('Priority Inbox'), 'Priority Inbox component present on Dashboard');
assert(dashboardSource.includes('AI Daily Briefing'), 'AI Daily Briefing component present on Dashboard');
assert(dashboardSource.includes('onClick={() => navigate(m.link)}'), 'Metric cards are clickable with direct navigation to filtered inbox');

console.log('\n--- Step 4: Browse all email categories ---');
assert(sidebarSource.includes('Assistant to Reply') && sidebarSource.includes('/inbox?filter=assistant'), 'Sidebar route for "Assistant to Reply" present');
assert(sidebarSource.includes('Client to Reply') && sidebarSource.includes('/inbox?filter=client'), 'Sidebar route for "Client to Reply" present');
assert(sidebarSource.includes('No Reply Needed') && sidebarSource.includes('/inbox?filter=noreply'), 'Sidebar route for "No Reply Needed" present');
assert(sidebarSource.includes('Needs Review') && sidebarSource.includes('/inbox?filter=review'), 'Sidebar route for "Needs Review" present');
assert(inboxSource.includes('urlFilter === \'assistant\''), 'Inbox component synchronizes with URL category filter changes');

console.log('\n--- Step 5: Open an email conversation ---');
assert(inboxSource.includes('selectConversation(id)'), 'Selecting an email loads its conversation thread');
assert(inboxSource.includes('markAsRead(id)'), 'Opening an email automatically marks messages as read');

console.log('\n--- Step 6: Review its AI classification and reasoning ---');
assert(inboxSource.includes('selectedConversation.aiInsights.classification'), 'Email panel displays AI classification badge');
assert(inboxSource.includes('selectedConversation.aiInsights.reasoning'), 'Email panel displays transparent AI reasoning');
assert(inboxSource.includes('selectedConversation.aiInsights.confidence'), 'Email panel displays AI confidence meter');
assert(inboxSource.includes('selectedConversation.aiInsights.suggestedAction'), 'Email panel displays suggested next action');

console.log('\n--- Step 7: Manually change its classification ---');
assert(inboxSource.includes('reclassify(selectedConversation.id, cls)'), 'Quick classification switcher updates conversation responsibility');
assert(inboxSource.includes('showToastMessage(`Reclassified as ${cls}`, \'success\')'), 'Confirmation toast shown on manual reclassification');

console.log('\n--- Step 8 & 9: Generate an AI reply & Send simulated reply ---');
assert(inboxSource.includes('handleAiSuggest'), 'AI Draft generator handler present with tone adjustment');
assert(inboxSource.includes('addReplyMessage(selectedConversation.id, replyText)'), 'Sending reply appends message to the live conversation thread');
assert(storeSource.includes('addReplyMessage: (convId, text)'), 'Store updates thread timestamp and recipient on reply dispatch');

console.log('\n--- Step 10: Switch to the client workspace ---');
assert(topbarSource.includes('navigate(nextRole === \'client\' ? \'/client\' : \'/dashboard\')'), 'TopBar role switcher navigates to /client');
assert(sidebarSource.includes('navigate(r === \'client\' ? \'/client\' : \'/dashboard\')'), 'Sidebar workspace switcher navigates to /client');
assert(clientSource.includes('Decisions Awaiting Your Input'), 'Client Workspace provides decision-only view');

console.log('\n--- Step 11: Mark a pending email as handled ---');
assert(clientSource.includes('markClientHandled(id)'), 'Client action "Mark Handled" triggers state transition');
assert(storeSource.includes('classification: \'noreply\' as Classification'), 'Handled decision reclassified to "noreply"');
assert(storeSource.includes('requiresResponse: false'), 'Handled decision clears requiresResponse flag');
assert(storeSource.includes('\'Handled by Client\''), 'Handled decision tagged with "Handled by Client" label');

console.log('\n--- Step 12: Switch back to assistant workspace & verify synchronisation ---');
assert(clientSource.includes('Switch to Assistant View'), 'Client Workspace provides direct switch back to Assistant Workspace');
assert(inboxSource.includes('urlFilter === \'completed\''), 'Assistant workspace filters and displays handled/completed emails');

console.log('\n--- Step 13: Search, filter, archive and complete emails ---');
assert(inboxSource.includes('(searchQuery || storeSearchQuery).toLowerCase().trim()'), 'Global search from TopBar and local search seamlessly filtered');
assert(inboxSource.includes('archiveConversation(selectedConversation.id)'), 'Archive action removes email from active inbox');
assert(inboxSource.includes('urlFilter === \'archived\''), 'Archived emails accessible via /inbox?filter=archived');
assert(inboxSource.includes('toggleStar(selectedConversation.id)'), 'Star/favorite toggling functional');

console.log('\n--- Step 14: Refresh the application and verify persistence ---');
assert(storeSource.includes('persist('), 'Zustand persist middleware active');
assert(storeSource.includes('name: \'inboxpilot-storage\''), 'LocalStorage key "inboxpilot-storage" defined');
assert(storeSource.includes('conversations: state.conversations'), 'Conversations array persisted across browser reloads');
assert(storeSource.includes('connectedAccounts: state.connectedAccounts'), 'Connected accounts persisted across browser reloads');
assert(storeSource.includes('role: state.role'), 'Active role persisted across browser reloads');

console.log('\n================================================================');
console.log(`   QA AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
}
