import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Route } from "wouter";

import { PageBook } from "./PageBook";
import { PageHome } from "./PageHome";
import { PageSeries } from "./PageSeries";

const queryClient = new QueryClient();

export function App(props) {
  return (
    <QueryClientProvider client={queryClient}>
      <Route path="/series/:seriesId" component={PageSeries} />
      <Route path="/book/:bookId" component={PageBook} />
      <Route path="/" component={PageHome} />
    </QueryClientProvider>
  );
}
