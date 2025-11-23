import User from '../models/User';
import Event from '../models/Event';
import Campaign from '../models/Campaign';
import logger from '../utils/logger';

export class AnalyticsService {
    async identify(userId: string, traits: any) {
        // Upsert user
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: { traits } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        logger.info(`User identified: ${userId}`);
        return user;
    }

    async track(userId: string, eventName: string, properties: any) {
        // Record event
        const event = await Event.create({
            userId,
            event: eventName,
            properties,
        });

        // Match campaigns
        // Fetch active campaigns with this trigger
        const campaigns = await Campaign.find({
            status: 'active',
            trigger: eventName,
        });

        // Fetch user for rule evaluation
        const user = await User.findById(userId);
        const userTraits = user ? user.traits : {};

        const matched = campaigns.filter(c => {
            if (!c.rules || c.rules.length === 0) return true;
            return c.rules.every((r: any) => this.evaluateRule(r, userTraits, properties));
        });

        logger.info(`Event tracked: ${eventName} for ${userId}. Matched ${matched.length} campaigns.`);

        return {
            ok: true,
            matched,
        };
    }

    private evaluateRule(rule: any, userTraits: any, eventProps: any) {
        const source = rule.type === 'attribute' ? userTraits : eventProps || {};
        const left = source?.[rule.field];
        if (left === undefined) return false;

        const right = rule.value;

        // Simple evaluation logic
        switch (rule.operator) {
            case '==': return left == right;
            case '!=': return left != right;
            case '>': return Number(left) > Number(right);
            case '>=': return Number(left) >= Number(right);
            case '<': return Number(left) < Number(right);
            case '<=': return Number(left) <= Number(right);
            case 'contains': return String(left).includes(String(right));
            default: return false;
        }
    }
}
