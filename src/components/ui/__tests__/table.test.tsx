import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from '../table';

describe('Table Components', () => {
  describe('Table', () => {
    test('renders table component', () => {
      render(<Table data-testid="table"><tbody><tr><td>Cell</td></tr></tbody></Table>);
      expect(screen.getByTestId('table')).toBeInTheDocument();
    });
  });

  describe('TableHeader', () => {
    test('renders table header', () => {
      render(
        <table>
          <TableHeader data-testid="header">
            <tr><th>Header</th></tr>
          </TableHeader>
        </table>
      );
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });
  });

  describe('TableBody', () => {
    test('renders table body', () => {
      render(
        <table>
          <TableBody data-testid="body">
            <tr><td>Body</td></tr>
          </TableBody>
        </table>
      );
      expect(screen.getByTestId('body')).toBeInTheDocument();
    });
  });

  describe('TableFooter', () => {
    test('renders table footer', () => {
      render(
        <table>
          <TableFooter data-testid="footer">
            <tr><td>Footer</td></tr>
          </TableFooter>
        </table>
      );
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  describe('TableRow', () => {
    test('renders table row', () => {
      render(
        <table>
          <tbody>
            <TableRow data-testid="row">
              <td>Row</td>
            </TableRow>
          </tbody>
        </table>
      );
      expect(screen.getByTestId('row')).toBeInTheDocument();
    });
  });

  describe('TableHead', () => {
    test('renders table head cell', () => {
      render(
        <table>
          <thead>
            <tr>
              <TableHead>Head Cell</TableHead>
            </tr>
          </thead>
        </table>
      );
      expect(screen.getByText('Head Cell')).toBeInTheDocument();
    });
  });

  describe('TableCell', () => {
    test('renders table cell', () => {
      render(
        <table>
          <tbody>
            <tr>
              <TableCell>Cell Content</TableCell>
            </tr>
          </tbody>
        </table>
      );
      expect(screen.getByText('Cell Content')).toBeInTheDocument();
    });
  });
});
