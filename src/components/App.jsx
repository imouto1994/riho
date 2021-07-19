import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import { PageBook } from "./PageBook";
import { PageHome } from "./PageHome";
import { PageTitle } from "./PageTitle";
import { ScrollToTop } from "./ScrollToTop";

const queryClient = new QueryClient();

export function App(props) {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ScrollToTop />
        <Switch>
          <Route path="/title/:titleId" component={PageTitle} />
          <Route path="/book/:bookId" component={PageBook} />
          <Route path="/" component={PageHome} />
        </Switch>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
