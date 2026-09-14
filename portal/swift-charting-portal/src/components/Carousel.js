import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import cx from 'classnames';
import makeStyles from '@mui/styles/makeStyles';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import Box from './Box';

const useStyles = makeStyles(() => ({
  cyclesContainer: {
    position: 'relative',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
  },
  cardScrollIconLeft: {
    cursor: 'pointer',
  },
  cardScrollIconRight: {
    cursor: 'pointer',
  },
  cardsContainer: {
    display: 'flex',
    overflowX: 'hidden',
    width: '100%',
  },
}));

const Carousel = ({
  data = [], // array of items to render
  render, // render function to render UI of single card
  preButtonClass, // optional: prev button class to style the previous button
  nextButtonClass, // optional: next button class to style the next button
  initialScrollIndex, // intial scroll index to focus the card we like to focus initially
  cardWidth,
}) => {
  const styles = useStyles();
  const cardsRef = useRef();
  const [scrollWidth, setScrollWidth] = useState(0);
  const [isScrollToCardCompleted, setScrollToCardCompleted] = useState(false);

  useLayoutEffect(() => {
    const mod = cardsRef.current.clientWidth % cardWidth;
    setScrollWidth(
      Math.floor(cardsRef.current.clientWidth / cardWidth) * cardWidth +
        (mod / cardWidth > 0.8 ? cardWidth : 0)
    );
  }, [cardWidth]);

  const onClickNextCard = useCallback(() => {
    const card = cardsRef.current;
    card.scrollTo({
      left: card.scrollLeft + scrollWidth - (card.scrollLeft % scrollWidth),
      behavior: 'smooth',
    });
  }, [scrollWidth]);

  useEffect(() => {
    if (initialScrollIndex > -1 && !isScrollToCardCompleted) {
      const card = cardsRef.current;
      if (data && card) {
        const requiredScrollLeft =
          card.scrollLeft +
          cardWidth * initialScrollIndex -
          (card.scrollLeft % cardWidth);
        card.scrollTo({ left: requiredScrollLeft, behavior: 'smooth' });
        setScrollToCardCompleted(true);
      }
    }
  }, [data, initialScrollIndex, cardWidth, isScrollToCardCompleted]);

  const onClickPrevCard = useCallback(() => {
    const card = cardsRef.current;
    if (card.scrollLeft === 0) {
      card.scrollLeft = 1; // to call scrollTo if scrollLeft is already 0
    }
    card.scrollTo({
      left:
        card.scrollLeft -
        scrollWidth +
        (card.scrollLeft % scrollWidth &&
          scrollWidth - (card.scrollLeft % scrollWidth)),
      behavior: 'smooth',
    });
  }, [scrollWidth]);

  return (
    <Box className={styles.cyclesContainer}>
      <Box className={styles.row}>
        <Box
          className={cx(styles.cardScrollIconLeft, preButtonClass)}
          onClick={onClickPrevCard}
          sx={{ pr: '6px' }}
          tabIndex="0"
          role="button"
          onKeyDown={({ nativeEvent }) => {
            if (nativeEvent.code === 'Enter') onClickPrevCard();
          }}
        >
          <ArrowBackIosNewIcon />
        </Box>
        <div className={styles.cardsContainer} ref={cardsRef}>
          {data?.map((item, index) => render && render(item, index))}
        </div>
        <Box
          className={cx(styles.cardScrollIconRight, nextButtonClass)}
          onClick={onClickNextCard}
          sx={{}}
          tabIndex="0"
          role="button"
          onKeyDown={({ nativeEvent }) => {
            if (nativeEvent.code === 'Enter') onClickNextCard();
          }}
        >
          <ArrowForwardIosIcon />
        </Box>
      </Box>
    </Box>
  );
};

export default Carousel;
