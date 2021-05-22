import styles from './styles.module.scss';

interface SubscribeButtonProps {
    priceId: string;
}

const SubscribeButton = ({ priceId }: SubscribeButtonProps) => {
    return (
        <button className={styles.subscribeButton} type="button">
            Subscribe now
        </button>
    );
};

export default SubscribeButton;
