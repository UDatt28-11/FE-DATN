import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  :root {
    --primary-color: #cb8670;
    --secondary-color: #2a2a2a;
    --text-color: #6c757d;
    --white-color: #fff;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: var(--secondary-color);
    background-color: var(--white-color);
    overflow-x: hidden;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  main {
    flex: 1;
  }

  img {
    display: block;
    max-width: 100%;
    height: auto;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    background: none;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  ul {
    list-style: none;
  }

  /* Common styles */
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 15px;
  }

  .btn {
    display: inline-block;
    text-align: center;
    vertical-align: middle;
    user-select: none;
    transition: all 0.3s ease;
  }

  .btn.palatin-btn {
    background-color: var(--primary-color);
    color: var(--white-color);
    padding: 12px 30px;
    border-radius: 0;
    font-size: 16px;
    text-transform: uppercase;
    letter-spacing: 1px;

    &:hover {
      background-color: var(--secondary-color);
    }
  }

  .section-padding {
    padding: 100px 0;
  }

  .section-heading {
    text-align: center;
    margin-bottom: 50px;

    h2 {
      font-size: 42px;
      margin-bottom: 15px;
      color: var(--secondary-color);
    }

    p {
      font-size: 18px;
      color: var(--text-color);
    }

    &.white {
      h2, p {
        color: var(--white-color);
      }
    }
  }

  /* Grid system */
  .row {
    display: flex;
    flex-wrap: wrap;
    margin-right: -15px;
    margin-left: -15px;
  }

  [class*="col-"] {
    padding-right: 15px;
    padding-left: 15px;
  }

  /* Responsive */
  @media (max-width: 991px) {
    .section-heading {
      h2 {
        font-size: 36px;
      }
    }
  }

  @media (max-width: 767px) {
    .section-heading {
      h2 {
        font-size: 30px;
      }
    }
  }
`;

export default GlobalStyle;