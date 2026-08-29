// English — the reference dictionary. Every key here must exist in fa.ts and ps.ts.
const en = {
  // app / nav
  "app.title": "Poultry Management System", "app.short": "PMS",
  "nav.dashboard": "Dashboard", "nav.flocks": "Flocks", "nav.sheds": "Sheds", "nav.dailyLogs": "Daily Logs",
  "nav.movements": "Bird Movements", "nav.users": "Users", "nav.profile": "Profile", "nav.logout": "Logout",
  // auth
  "auth.login": "Login", "auth.signingIn": "Signing in…", "auth.phone": "Phone", "auth.password": "Password",
  "auth.invalid": "Invalid phone or password", "auth.enterBoth": "Enter phone and password",
  "auth.tagline": "Every bird counted.\nEvery day recorded.",
  "auth.blurb": "Flocks, sheds, daily logs and alerts for broiler and layer farms — built to work on a phone, in the shed, in your language.",
  "auth.demo": "Demo: 0700000001 / owner123 · 0700000003 / worker123", "auth.language": "Language",
  // common
  "common.save": "Save", "common.cancel": "Cancel", "common.edit": "Edit", "common.delete": "Delete", "common.close": "Close",
  "common.open": "Open", "common.saving": "Saving…", "common.notes": "Notes", "common.date": "Date", "common.flock": "Flock",
  "common.type": "Type", "common.status": "Status", "common.quantity": "Quantity", "common.cause": "Cause", "common.name": "Name",
  "common.yes": "Yes", "common.no": "No", "common.you": "you", "common.of": "of", "common.week": "week", "common.days": "d",
  "common.birds": "birds", "common.trays": "trays", "common.noRecords": "No records yet.", "common.active": "Active", "common.inactive": "Inactive",
  "common.kg": "kg", "common.free": "free", "common.dash": "—",
  // dashboard
  "dash.title": "Dashboard", "dash.allNormal": "All flocks normal", "dash.alertsNeed": "{n} alert(s) need attention",
  "dash.recordToday": "Record today", "dash.activeFlocks": "Active flocks", "dash.totalBirds": "Total birds",
  "dash.deathsToday": "Deaths today", "dash.eggsToday": "Eggs today", "dash.feedToday": "Feed today",
  "dash.population": "Population", "dash.mortality": "Mortality", "dash.age": "Age", "dash.noFlocks": "No active flocks yet.", "dash.createOne": "Create one",
  // flocks
  "flocks.title": "Flocks", "flocks.nActive": "{n} active", "flocks.new": "New flock", "flocks.edit": "Edit", "flocks.typeBreed": "Type / breed",
  "flocks.shed": "Shed", "flocks.intake": "Intake", "flocks.age": "Age", "flocks.population": "Population", "flocks.mortality": "Mortality",
  "flocks.none": "No flocks yet.", "flocks.intakeOn": "intake {date}", "flocks.close": "Close", "flocks.closeTitle": "Close {name}?",
  "flocks.closeDesc": "Marks the flock COMPLETED. No further logs or movements can be recorded.", "flocks.closeFlock": "Close flock",
  "flocks.kpi.population": "Population", "flocks.kpi.age": "Age", "flocks.kpi.cumMortality": "Cum. mortality", "flocks.kpi.deathsToday": "Deaths today",
  "flocks.kpi.totalFeed": "Total feed", "flocks.kpi.henDay": "Hen-day today", "flocks.kpi.sold": "Sold", "flocks.kpi.perBird": "{n} g/bird", "flocks.kpi.nBirds": "{n} birds",
  "flocks.chart.population": "Population", "flocks.chart.mortality": "Daily mortality", "flocks.chart.henDay": "Hen-day production %",
  "flocks.recentLogs": "Recent daily logs", "flocks.movements": "Bird movements", "flocks.noLogs": "No logs yet.", "flocks.noMovements": "No movements yet.",
  "flocks.form.title": "New flock", "flocks.form.editTitle": "Edit {name}", "flocks.form.desc": "Initial quantity must fit the shed's free capacity.",
  "flocks.form.name": "Flock name", "flocks.form.breed": "Breed", "flocks.form.shed": "Shed (free capacity)", "flocks.form.freeOf": "{free} free of {cap}",
  "flocks.form.intakeDate": "Intake date", "flocks.form.initialQty": "Initial quantity", "flocks.form.initialWeight": "Initial avg weight (g)", "flocks.form.chickCost": "Chick cost total (AFN)",
  // sheds
  "sheds.title": "Sheds", "sheds.summary": "{n} houses · {birds} birds housed", "sheds.add": "Add shed", "sheds.birds": "{n} birds", "sheds.pctOf": "{pct}% of {cap}",
  "sheds.sensors": "sensors", "sheds.deleteTitle": "Delete {name}?", "sheds.deleteDesc": "Only sheds with no flocks can be deleted. This cannot be undone.",
  "sheds.form.title": "New shed", "sheds.form.editTitle": "Edit {name}", "sheds.form.desc": "A physical house where a flock lives.",
  "sheds.form.name": "Shed name", "sheds.form.capacity": "Capacity (birds)", "sheds.form.type": "Type", "sheds.form.status": "Status", "sheds.form.hasSensors": "Has environment sensors",
  // daily logs
  "logs.title": "Daily logs", "logs.subtitle": "Feed, water and egg records per flock", "logs.record": "Record today",
  "logs.feedKg": "Feed kg", "logs.waterL": "Water L", "logs.eggs": "Eggs", "logs.broken": "Broken", "logs.recordedBy": "Recorded by",
  "logs.deleteTitle": "Delete this daily log?", "logs.deleteDesc": "Removes the {date} log for {flock}. Mortality movements are kept.",
  "logs.form.title": "Daily log", "logs.form.editTitle": "Edit log · {date}",
  "logs.form.desc": "Deaths entered here create a MORTALITY movement. Saving an existing date updates it.",
  "logs.form.deaths": "💀 Deaths today", "logs.form.feed": "🌾 Feed (kg)", "logs.form.water": "💧 Water (L)", "logs.form.eggs": "🥚 Eggs collected", "logs.form.eggsBroken": "🥚 Eggs broken",
  // movements
  "mov.title": "Bird movements", "mov.subtitle": "Mortality, culls, sales and transfers", "mov.record": "Record movement", "mov.movement": "Movement",
  "mov.qty": "Qty", "mov.avgWt": "Avg wt (g)", "mov.deleteTitle": "Delete this movement?", "mov.deleteDesc": "Restores {n} birds to {flock}.",
  "mov.form.title": "Bird movement", "mov.form.editTitle": "Edit movement", "mov.form.desc": "Mortality, cull, sale or transfer out of the flock.",
  "mov.form.avgWeight": "Avg weight (g)", "mov.form.avgWeightHint": "Required for broiler sales",
  // profile
  "profile.title": "My profile", "profile.subtitle": "Account details, language and password", "profile.edit": "Edit profile", "profile.changePw": "Change password",
  "profile.memberSince": "Member since {date}", "profile.permissions": "Permissions", "profile.permissionsDesc": "What the {role} role can access",
  "profile.activity": "My recent activity", "profile.when": "When", "profile.action": "Action", "profile.record": "Record", "profile.noActivity": "No activity yet.",
  "profile.form.title": "Edit profile", "profile.form.desc": "Your name, login phone and interface language.", "profile.form.fullName": "Full name",
  "profile.form.phone": "Phone (login)", "profile.form.language": "Language",
  "pw.title": "Change password", "pw.current": "Current password", "pw.new": "New password", "pw.hint": "At least 6 characters", "pw.confirm": "Confirm new password", "pw.update": "Update password",
  // users
  "users.title": "Users", "users.nActive": "{n} active accounts", "users.new": "New user", "users.phone": "Phone", "users.role": "Role", "users.language": "Language",
  "users.deactivateTitle": "Deactivate {name}?", "users.deactivateDesc": "They will no longer be able to log in. Their records are kept.",
  "users.reactivateTitle": "Reactivate {name}?", "users.reactivateDesc": "They will be able to log in again.", "users.deactivate": "Deactivate", "users.reactivate": "Reactivate",
  "users.form.title": "New user", "users.form.editTitle": "Edit {name}", "users.form.descEdit": "Leave password blank to keep the current one.",
  "users.form.descNew": "The user logs in with their phone number.", "users.form.password": "Password", "users.form.resetPassword": "Reset password", "users.form.active": "Active (can log in)",
  // permissions
  "perm.records": "Records", "perm.reports": "Reports", "perm.alerts": "Alerts", "perm.finance": "Finance", "perm.health": "Health", "perm.admin": "Administration", "perm.records:read": "Records (read-only)",
  // alerts
  "alert.ABNORMAL_MORTALITY.msg": "{flock}: daily mortality {pct}% exceeds {threshold}%", "alert.ABNORMAL_MORTALITY.action": "Isolate sick birds, call veterinarian",
  "alert.MISSING_DAILY_LOG.msg": "{flock}: no daily log recorded today", "alert.MISSING_DAILY_LOG.action": "Remind assigned worker",
  "severity.LOW": "Low", "severity.MEDIUM": "Medium", "severity.HIGH": "High", "severity.CRITICAL": "Critical",
  // errors (server actions)
  "err.invalid": "Invalid input: {fields}", "err.shedExists": "Shed name already exists", "err.shedNotFound": "Shed not found",
  "err.capacityBelowHoused": "Capacity cannot be below the {n} birds currently housed", "err.shedHasFlocks": "Shed has flocks assigned; cannot delete",
  "err.capacityExceeded": "Shed capacity {cap} exceeded ({housed} housed + {added} new = {total})", "err.flockExists": "Flock name already exists",
  "err.qtyBelowRemoved": "Initial quantity is below birds already removed", "err.flockInactive": "Flock not found or not active",
  "err.dateBeforeIntake": "Date is before flock intake date", "err.brokenExceeds": "Broken eggs cannot exceed collected eggs",
  "err.qtyPositive": "Quantity must be positive", "err.notEnoughBirds": "Only {n} birds present; cannot remove {q}",
  "err.weightRequired": "Average weight is required for broiler sales", "err.phoneInUse": "Phone number already in use",
  "err.wrongPassword": "Current password is incorrect", "err.pwMismatch": "Passwords do not match", "err.pwShort": "At least 6 characters",
  "err.selfDemote": "You cannot demote or deactivate your own account", "err.selfDeactivate": "You cannot deactivate your own account", "err.pwRequired": "Password is required for a new user",
  // enums
  "enum.OWNER": "Owner", "enum.FARM_MANAGER": "Farm manager", "enum.WORKER": "Worker", "enum.VETERINARIAN": "Veterinarian", "enum.ACCOUNTANT": "Accountant",
  "enum.OPEN_SIDED": "Open-sided", "enum.CLOSED_ENVIRONMENT": "Closed environment", "enum.SEMI_CLOSED": "Semi-closed",
  "enum.OCCUPIED": "Occupied", "enum.EMPTY": "Empty", "enum.CLEANING": "Cleaning", "enum.MAINTENANCE": "Maintenance",
  "enum.BROILER": "Broiler", "enum.LAYER": "Layer", "enum.ACTIVE": "Active", "enum.COMPLETED": "Completed",
  "enum.MORTALITY": "Mortality", "enum.CULL": "Cull", "enum.SALE": "Sale", "enum.TRANSFER": "Transfer", "enum.THEFT_LOSS": "Theft / loss",
  "enum.DISEASE": "Disease", "enum.HEAT": "Heat", "enum.INJURY": "Injury", "enum.PREDATOR": "Predator", "enum.LOW_PRODUCTION": "Low production", "enum.MARKET_READY": "Market ready", "enum.UNKNOWN": "Unknown",
  "enum.CREATE": "Created", "enum.UPDATE": "Updated", "enum.DELETE": "Deleted",
  "enum.EN": "English", "enum.FA_DARI": "دری (Dari)", "enum.PS_PASHTO": "پښتو (Pashto)",
  // field names (used in validation messages)
  "field.shedName": "shed name", "field.capacity": "capacity", "field.flockName": "flock name", "field.breed": "breed", "field.shedId": "shed", "field.intakeDate": "intake date",
  "field.initialQuantity": "initial quantity", "field.initialAvgWeightG": "initial weight", "field.chickCostAfn": "chick cost", "field.date": "date", "field.feedConsumedKg": "feed",
  "field.waterConsumedL": "water", "field.eggsCollected": "eggs collected", "field.eggsBroken": "eggs broken", "field.mortality": "deaths", "field.quantity": "quantity",
  "field.averageWeightG": "average weight", "field.fullName": "full name", "field.phone": "phone", "field.language": "language", "field.role": "role", "field.password": "password",
  "field.currentPassword": "current password", "field.newPassword": "new password", "field.confirmPassword": "confirm password", "field.notes": "notes", "field.movementType": "type", "field.cause": "cause",
} as const;
export default en;
