import React from 'react';

import css from './Slide.module.css'

export default ({children}) => (
  <div className={css.container}>
    {children}
  </div>
);
