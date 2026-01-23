import React, { useState, useEffect } from 'react';
import { getUserNameColor } from '../../utils/cosmetic';

interface NameWithColorProps {
    userId: string;
    name: string;
    style?: React.CSSProperties;
    className?: string;
    onClick?: (e: React.MouseEvent) => void;
}

export const NameWithColor: React.FC<NameWithColorProps> = ({ userId, name, style, className, onClick }) => {
    const [nameColor, setNameColor] = useState<string | undefined>(undefined);

    useEffect(() => {
        let isMounted = true;
        const fetchColor = async () => {
            // キャッシュがあればそれを使う（未実装だが将来的に）
            const color = await getUserNameColor(userId);
            if (isMounted && color) {
                setNameColor(color);
            }
        };

        fetchColor();

        return () => {
            isMounted = false;
        };
    }, [userId]);

    const combinedStyle: React.CSSProperties = {
        ...style,
        ...(nameColor ? {
            background: nameColor,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            display: 'inline-block',
        } : {
            color: style?.color || 'var(--text)',
        }),
    };

    return (
        <span
            className={className}
            style={combinedStyle}
            onClick={onClick}
        >
            {name}
        </span>
    );
};
