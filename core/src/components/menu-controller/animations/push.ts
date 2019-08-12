import { IonicAnimation, MenuI } from '../../../interface';
import { createAnimation } from '../../../utils/animation/animation';

import { baseAnimation } from './base';

/**
 * Menu Push Type
 * The content slides over to reveal the menu underneath.
 * The menu itself also slides over to reveal its bad self.
 */
export const menuPushAnimation = (menu: MenuI): IonicAnimation => {
  let contentOpenedX: string;
  let menuClosedX: string;

  const width = menu.width;

  if (menu.isEndSide) {
    contentOpenedX = -width + 'px';
    menuClosedX = width + 'px';

  } else {
    contentOpenedX = width + 'px';
    menuClosedX = -width + 'px';
  }

  const menuAnimation = createAnimation()
    .addElement(menu.menuInnerEl)
    .fromTo('transform', `translateX(${menuClosedX})`, 'translateX(0px)');

  const contentAnimation = createAnimation()
    .addElement(menu.contentEl)
    .fromTo('transform', 'translateX(0px)', `translateX(${contentOpenedX})`);

  const backdropAnimation = createAnimation()
    .addElement(menu.backdropEl)
    .fromTo('opacity', 0.01, 0.32);

  const isIos = menu.mode === 'ios';

  return baseAnimation(AnimationC, isIos).then(animation => {
    return animation.add(menuAnimation)
      .add(backdropAnimation)
      .add(contentAnimation);
  });
};
