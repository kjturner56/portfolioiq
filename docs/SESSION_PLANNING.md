# PortfolioIQ — Session Planning Checklist
Run through this before every Claude Code build session.

## Pre-Session Checklist
- [ ] Read open GitHub Issues and incorporate any blockers into this session
- [ ] Review BACKLOG.md — has anything moved to high priority?
- [ ] Review DECISIONS.md — does anything need revisiting?
- [ ] Check CLAUDE.md — are all rules current?
- [ ] Read the pseudocode section for this session
- [ ] Identify anything that will be hard to change after this session
- [ ] Confirm all tests from last session still pass: `npm test`

## Questions to Ask Before Writing Code
- What assumptions are we making that haven't been validated?
- What will be hard to change after this session builds on it?
- Does any new state need to go in AppContext?
- Does any new constant need to go in config.js or colors.js?
- Does any new utility need to be a pure function?
- Does this session touch the Claude API? If so, is it in FIELD_REQUIREMENTS?
- Does this session produce output Jan will show a client? If so, is HITL enforced?

## Post-Session Checklist
- [ ] All tests passing: `npm test`
- [ ] All commits pushed to origin/main
- [ ] DECISIONS.md updated with any decisions made this session
- [ ] BACKLOG.md updated — move completed items, add new ideas
- [ ] GitHub Issues closed for anything resolved this session
- [ ] Note anything to address at the start of next session
