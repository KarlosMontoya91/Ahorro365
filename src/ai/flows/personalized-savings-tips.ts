export type PersonalizedSavingsTipsOutput = {
    tip: string;
    motivation: string;
};

export const personalizedSavingsTips = async (input: { savingsHistory: string, postponedAmounts: string }): Promise<PersonalizedSavingsTipsOutput> => {
    return {
        tip: "¡Buen comienzo! La constancia es la clave del ahorro.",
        motivation: "Cada día cuenta para alcanzar tus metas."
    };
};