import { useRouteError, Link, isRouteErrorResponse } from "react-router-dom";
import styles from "./ErrorPage.module.css";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div className={styles.errorPage} data-testid="error">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        {isRouteErrorResponse(error) ? (
          <i>
            {error.status} {error.statusText}
          </i>
        ) : error instanceof Error ? (
          <i>{error.message}</i>
        ) : (
          <i>Unknown Error</i>
        )}
      </p>
      <button>
        <Link to={"/"}>Back to Home</Link>
      </button>
    </div>
  );
}
