<?php

/**
 * Replace GoogleAnalytics Page Block to include categories for tracking
 *
 * @package    Custom_GoogleAnalytics
 * @author     ronny
 */
class Custom_GoogleAnalytics_Block_Ga extends Mage_GoogleAnalytics_Block_Ga
{

    /**
     * Override core method
     */
    protected function _getOrdersTrackingCode()
    {
        $orderIds = $this->getOrderIds();
        if (empty($orderIds) || !is_array($orderIds)) {
            return;
        }
        $collection = Mage::getResourceModel('sales/order_collection')
            ->addFieldToFilter('entity_id', array('in' => $orderIds))
        ;
        $result = array();
        foreach ($collection as $order) {
            if ($order->getIsVirtual()) {
                $address = $order->getBillingAddress();
            } else {
                $address = $order->getShippingAddress();
            }
            $result[] = sprintf("_gaq.push(['_addTrans', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s']);",
                $order->getIncrementId(),
                $this->jsQuoteEscape(Mage::app()->getStore()->getFrontendName()),
                $order->getBaseGrandTotal(),
                $order->getBaseTaxAmount(),
                $order->getBaseShippingAmount(),
                $this->jsQuoteEscape(Mage::helper('core')->escapeHtml($address->getCity())),
                $this->jsQuoteEscape(Mage::helper('core')->escapeHtml($address->getRegion())),
                $this->jsQuoteEscape(Mage::helper('core')->escapeHtml($address->getCountry()))
            );
            foreach ($order->getAllVisibleItems() as $item) {
				
				// find categories of item
				$cProduct = Mage::getModel('catalog/product'); 
				$cProductId = $cProduct->getIdBySku($item->getSku()); 
				$cProduct->load($cProductId); // load original product
				if($cProduct->getTypeId() == "simple"){
					$cParentIds = Mage::getModel('catalog/product_type_grouped')->getParentIdsByChild($cProduct->getId());
					if(!$cParentIds)
						$cParentIds = Mage::getModel('catalog/product_type_configurable')->getParentIdsByChild($cProduct->getId());
					if(isset($cParentIds[0])){
						$cParent = Mage::getModel('catalog/product')->load($cParentIds[0]);
						$cProductId = $cParent->getId(); // change product id to parent id
						$cProduct->load($cProductId); // reload product inn case changes
					}
				}
				$category_list = ""; // start a string variable
				$cats = $cProduct->getCategoryCollection()->exportToArray(); // get list of categories
				foreach($cats as $cat){ 
					$cname = Mage::getModel('catalog/category')->load($cat['entity_id'])->getName();
					$category_list .= $cname ."|"; // delimiter
				}
				$category_list = rtrim($category_list,"|"); // make it pretty
				
				$result[] = sprintf("_gaq.push(['_addItem', '%s', '%s', '%s', '%s', '%s', '%s']);",
					$order->getIncrementId(),
					$this->jsQuoteEscape($item->getSku()), $this->jsQuoteEscape($item->getName()),
					$this->jsQuoteEscape($category_list), // now there IS a "category" defined for the order item!
					$item->getBasePrice(), $item->getQtyOrdered()
				);
            }
            $result[] = "_gaq.push(['_trackTrans']);";
        }
        return implode("\n", $result);
    }

}
