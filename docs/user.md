## Total Roles:
- These are only for system access level identifer and user.

| Role      | Purpose                 |
| --------- | ----------------------- |
| USER      | regular platform access |
| ADMIN     | platform management     |
| MODERATOR | content moderation      |
| SUPPORT   | customer support        |

## Total Occupations:
- These all are business level identifier.
```javascript
export const OCCUPATIONS = {
  FARMER: 'FARMER',
  AGRI_EXPERT: 'AGRI_EXPERT',
  TRADER: 'TRADER',
  VENDOR: 'VENDOR',
  AGRI_WORKER: 'AGRI_WORKER',
  OTHER: 'OTHER',
} as const
```