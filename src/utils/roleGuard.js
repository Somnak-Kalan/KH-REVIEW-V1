// src/utils/roleGuard.js

export const USER_ROLES = {
    NORMAL: 'normal',
    CONTENT_CREATOR: 'content_creator',
    BUSINESS_OWNER: 'business_owner',
}

export function isNormalUser(role) {
    return role === USER_ROLES.NORMAL
}

export function guardNormalUser(role) {
    return {
        allowed: isNormalUser(role),
        reason: isNormalUser(role)
            ? ''
            : `This profile UI is only for Normal users. Your role is "${role}".`,
    }
}

/**
 * Example usage:
 * const { allowed } = guardNormalUser(user.role)
 * if (!allowed) return <Result status="403" ... />
 */