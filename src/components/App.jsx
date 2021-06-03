import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import { PageBook } from "./PageBook";
import { PageHome } from "./PageHome";
import { PageSeries } from "./PageSeries";
import { ScrollToTop } from "./ScrollToTop";

const queryClient = new QueryClient();

export function App(props) {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ScrollToTop />
        <Switch>
          <Route path="/series/:seriesId">
            <PageSeries />
          </Route>
          <Route path="/book/:bookId">
            <PageBook />
          </Route>
          <Route path="/">
            <PageHome />
          </Route>
        </Switch>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
