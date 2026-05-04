'use client';

import { CreditCard, Check, Settings, Users } from 'lucide-react';

export default function SubscriptionsPage() {
    const plans = [
        {
            name: 'Basic',
            price: '$0',
            period: 'Forever',
            features: ['Access to Free Books', 'Personal Reading Lists', 'Standard Support'],
            activeUsers: 854,
            isPopular: false
        },
        {
            name: 'Premium',
            price: '$12',
            period: 'per month',
            features: ['Unlimited Book Access', 'Offline Downloading', 'Priority Support', 'Exclusive Content'],
            activeUsers: 342,
            isPopular: true
        },
        {
            name: 'Institutional',
            price: 'Custom',
            period: 'per year',
            features: ['Bulk Licensing', 'API Access', 'SSO Integration', 'Dedicated Account Manager'],
            activeUsers: 15,
            isPopular: false
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Subscription Plans</h1>
                    <p className="text-muted-foreground text-sm">Manage tier features, pricing, and active subscribers.</p>
                </div>
                <button className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 text-sm shadow-lg">
                    <Settings size={18} /> Configure Stripe
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan) => (
                    <div key={plan.name} className={`bg-card rounded-2xl p-6 border transition-all relative ${plan.isPopular ? 'border-indigo-500 shadow-indigo-500/10 shadow-2xl' : 'border-border hover:border-zinc-700'}`}>
                        {plan.isPopular && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full tracking-wider">
                                Most Popular
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                                <p className="text-muted-foreground text-sm">Review plan details</p>
                            </div>
                            <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                                <CreditCard size={20} />
                            </div>
                        </div>

                        <div className="mb-6">
                            <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                            <span className="text-muted-foreground text-sm font-medium"> / {plan.period}</span>
                        </div>

                        <div className="space-y-3 mb-8">
                            {plan.features.map((feature) => (
                                <div key={feature} className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <div className="w-5 h-5 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
                                        <Check size={12} />
                                    </div>
                                    {feature}
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-border flex items-center justify-between">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <Users size={16} />
                                <span className="text-foreground font-bold">{plan.activeUsers}</span> subscribers
                            </div>
                            <button className="text-indigo-400 text-sm font-bold hover:text-indigo-300">Edit Plan</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Subscriber List Placeholder */}
            <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-sm hover:shadow-md dark:shadow-none transition-shadow duration-300">
                <h3 className="text-lg font-bold text-foreground mb-2">Subscriber Management</h3>
                <p className="text-muted-foreground text-sm mb-4">Connect Stripe or Paypal to view real-time subscriber lists and manage cancellations.</p>
                <div className="flex items-center justify-center gap-4">
                    <button className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-zinc-700">Connect Stripe</button>
                    <button className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-zinc-700">Connect PayPal</button>
                </div>
            </div>
        </div>
    );
}
